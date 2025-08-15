import { Router } from "express";
import { z } from "zod";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import { db, withTx } from "../lib/db";
import { openai } from "../lib/openai";
import { estimateExportCostUSD } from "../services/pricing";
import { getMonthlyUsage, incMonthly } from "../services/usage";
import { sha256 } from "../lib/crypto";

const Body = z.object({
	orgId: z.string().uuid(),
	mode: z.literal("final"),
	compiledPrompt: z.string().min(1),
	images: z.array(z.object({ url: z.string() })).optional(),
	n: z.number().int().min(1).max(4).default(1),
	aspect: z.enum(["1:1", "2:3", "3:2"]).default("1:1"),
	quality: z.enum(["low", "medium", "high"]).default("medium"),
	background: z.enum(["auto", "transparent", "opaque"]).optional(),
	output_format: z.enum(["png", "webp", "jpeg"]).optional()
});

const SIZE_MAP = { "1:1": "1024x1024", "2:3": "1024x1536", "3:2": "1536x1024" } as const;

const r = Router();

r.post("/generate", async (req, res) => {
	const cfg = Body.parse(req.body);
	const { orgId } = cfg;
	const now = dayjs();
	const y = now.year(), m = now.month() + 1;

	const org = await db.one("select id, plan, reservation from orgs where id=$1", [orgId]);

	const key = sha256(
		JSON.stringify({
			prompt: cfg.compiledPrompt,
			images: (cfg.images ?? []).map((i) => i.url),
			aspect: cfg.aspect,
			quality: cfg.quality,
			n: cfg.n,
			background: cfg.background ?? "auto"
		})
	);
	const cached = await db.oneOrNone(
		"select image_b64 from gen_cache where org_id=$1 and key_sha256=$2 and created_at>now()-interval '24 hours'",
		[orgId, key]
	);
	if (cached) {
		await incMonthly(
			orgId,
			y,
			m,
			cfg.quality === "medium" ? "finals_medium" : cfg.quality === "low" ? "finals_low" : "finals_high",
			cfg.n
		);
		return res.json({ images: [{ mimeType: "image/png", base64: cached.image_b64 }], meta: { cached: true } });
	}

	const { usage } = await getMonthlyUsage(orgId, now);
	const quote = estimateExportCostUSD({
		quality: cfg.quality,
		n: cfg.n,
		finalsMediumSoFar: usage.finals_medium ?? 0,
		reservation: !!org.reservation
	});
	const cents = Math.round(quote.total * 100);

	try {
		await withTx(async (q) => {
			const w = await q("select balance_cents from wallets where org_id=$1 for update", [orgId]).then(r=>r.rows[0]);
			if (!w || w.balance_cents < cents) {
				const err: any = new Error("Insufficient balance");
				err.status = 402; throw err;
			}
			await q("update wallets set balance_cents=balance_cents-$1, updated_at=now() where org_id=$2", [cents, orgId]);
			await q("insert into wallet_ledger(id,org_id,kind,amount_cents,meta) values($1,$2,'debit',-$3,$4)",
				[uuid(), orgId, cents, { reason: "image_generate", quality: cfg.quality, n: cfg.n }]);
		});
	} catch (e: any) {
		return res.status(e?.status === 402 ? 402 : 500).json({ error: e?.status === 402 ? "Insufficient balance" : "Debit failed" });
	}

	const content: any[] = [{ type: "input_text", text: cfg.compiledPrompt }];
	for (const img of cfg.images ?? []) content.push({ type: "input_image", image_url: { url: img.url } });

	try {
		const req: any = {
			model: "gpt-image-1",
			input: [{ role: "user", content }],
			tools: [{ type: "image_generation" }],
			tool_config: {
				image_generation: {
					n: cfg.n,
					size: SIZE_MAP[cfg.aspect],
					quality: cfg.quality,
					background: cfg.background ?? "auto",
					output_format: cfg.output_format ?? "png"
				}
			}
		};
		const response = await (openai.responses as any).create(req);

		const images: { mimeType: string; base64: string }[] = [];
		const outputs = (response as any).output ?? [];
		for (const out of outputs) {
			if (out.type !== "image") continue;
			if (out.image?.b64_json || out.image?.b64) {
				const b64 = out.image.b64_json ?? out.image.b64;
				images.push({ mimeType: `image/${cfg.output_format ?? "png"}`, base64: b64 });
			} else if (out.image?.url) {
				const r2 = await fetch(out.image.url);
				const buf = Buffer.from(await r2.arrayBuffer());
				images.push({ mimeType: r2.headers.get("content-type") || "image/png", base64: buf.toString("base64") });
			} else if (out.image?.id) {
				const f = await (openai as any).files.content(out.image.id);
				const ab = await f.arrayBuffer();
				images.push({ mimeType: `image/${cfg.output_format ?? "png"}`, base64: Buffer.from(ab).toString("base64") });
			}
		}
		if (!images.length) throw new Error("No images returned");

		await incMonthly(
			orgId,
			y,
			m,
			cfg.quality === "medium" ? "finals_medium" : cfg.quality === "low" ? "finals_low" : "finals_high",
			cfg.n
		);
		await db.none(
			"insert into gen_cache(org_id,key_sha256,image_b64) values ($1,$2,$3) on conflict do nothing",
			[orgId, key, images[0].base64]
		);

		await db.none(
			"insert into runs(id,org_id,quality,aspect,n,mode,price_cents,prompt_sha256) values ($1,$2,$3,$4,$5,'final',$6,$7)",
			[uuid(), orgId, cfg.quality, cfg.aspect, cfg.n, cents, key]
		);

		res.json({ images, meta: { unitUSD: quote.unit, chargedUSD: quote.total, band: quote.band } });
	} catch (e: any) {
		await db.none("update wallets set balance_cents=balance_cents+$1 where org_id=$2", [cents, orgId]);
		await db.none(
			"insert into wallet_ledger(id,org_id,kind,amount_cents,meta) values ($1,$2,'refund',$3,$4)",
			[uuid(), orgId, cents, { reason: "provider_error", message: String(e?.message ?? e) }]
		);
		res.status(502).json({ error: "Generation failed" });
	}
});

export default r;

