import { Router } from "express";
import { z } from "zod";
import { db, withTx } from "../lib/db";
import { openai } from "../lib/openai";
import { v4 as uuid } from "uuid";
import { sha256 } from "../lib/crypto";
import dayjs from "dayjs";
import { estimateExportCostUSD } from "../services/pricing";
import { getMonthlyUsage, incMonthly } from "../services/usage";

const Body = z.object({
  orgId: z.string().uuid(),
  compiledPrompt: z.string(),
  images: z.array(z.object({ url: z.string() })).optional(),
  aspect: z.enum(["1:1","2:3","3:2"]),
  fromQuality: z.enum(["low","medium","high"]),
  toQuality: z.enum(["medium","high"]),
  n: z.number().int().min(1).max(4)
});

const r = Router();
r.post("/keep", async (req,res)=>{
  const cfg = Body.parse(req.body);
  const org = await db.one("select id, reservation from orgs where id=$1", [cfg.orgId]);

  const baseKey = sha256(JSON.stringify({
    prompt: cfg.compiledPrompt,
    images: (cfg.images ?? []).map(i=>i.url),
    aspect: cfg.aspect,
    quality: cfg.fromQuality, n: cfg.n
  }));
  const cached = await db.oneOrNone("select image_b64 from gen_cache where org_id=$1 and key_sha256=$2 and created_at>now()-interval '24 hours'",
    [cfg.orgId, baseKey]);

  const { usage } = await getMonthlyUsage(cfg.orgId, dayjs());
  const fromQuote = estimateExportCostUSD({ quality: cfg.fromQuality, n: cfg.n, finalsMediumSoFar: usage.finals_medium ?? 0, reservation: !!org.reservation });
  const toQuote   = estimateExportCostUSD({ quality: cfg.toQuality,   n: cfg.n, finalsMediumSoFar: usage.finals_medium ?? 0, reservation: !!org.reservation });
  const deltaCents = Math.max(0, Math.round((toQuote.total - fromQuote.total) * 100));

  if (cached && deltaCents === 0) {
    await incMonthly(cfg.orgId, dayjs().year(), dayjs().month()+1, cfg.toQuality==="medium"?"finals_medium":"finals_high", cfg.n);
    return res.json({ images: [{ mimeType:"image/png", base64: cached.image_b64 }], meta: { kept:true, chargedUSD: 0 } });
  }

  // True upgrade path: charge delta, re-render at higher quality
  if (deltaCents > 0) {
    try {
      await withTx(async (q)=>{
        const w = await q("select balance_cents from wallets where org_id=$1 for update", [cfg.orgId]).then(r=>r.rows[0]);
        if (!w || w.balance_cents < deltaCents) {
          const err: any = new Error("Insufficient balance"); err.status = 402; throw err;
        }
        await q("update wallets set balance_cents=balance_cents-$1, updated_at=now() where org_id=$2", [deltaCents, cfg.orgId]);
        await q("insert into wallet_ledger(id,org_id,kind,amount_cents,meta) values($1,$2,'debit',-$3,$4)",
          [uuid(), cfg.orgId, deltaCents, { reason: "upgrade_quality", from: cfg.fromQuality, to: cfg.toQuality, n: cfg.n }]);
      });
    } catch(e:any){
      return res.status(e?.status===402?402:500).json({ error: e?.status===402?"Insufficient balance":"Debit failed" });
    }

    const SIZE_MAP = { "1:1":"1024x1024", "2:3":"1024x1536", "3:2":"1536x1024" } as const;
    const content: any[] = [{ type:"input_text", text: cfg.compiledPrompt }];
    for (const img of (cfg.images ?? [])) content.push({ type:"input_image", image_url:{ url: img.url } });

    try {
      const req: any = {
        model: "gpt-image-1",
        input: [{ role: "user", content }],
        tools: [{ type: "image_generation" }],
        tool_config: {
          image_generation: {
            n: cfg.n,
            size: SIZE_MAP[cfg.aspect],
            quality: cfg.toQuality,
            background: "auto",
            output_format: "png"
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
          images.push({ mimeType: `image/png`, base64: b64 });
        } else if (out.image?.url) {
          const r2 = await fetch(out.image.url);
          const buf = Buffer.from(await r2.arrayBuffer());
          images.push({ mimeType: r2.headers.get("content-type") || "image/png", base64: buf.toString("base64") });
        }
      }
      if (!images.length) throw new Error("No images returned");

      await incMonthly(cfg.orgId, dayjs().year(), dayjs().month()+1, cfg.toQuality==="medium"?"finals_medium":"finals_high", cfg.n);
      return res.json({ images, meta: { kept:false, chargedUSD: deltaCents/100 } });
    } catch (e: any) {
      // Refund delta on provider error
      await withTx(async (q)=>{
        await q("update wallets set balance_cents=balance_cents+$1 where org_id=$2", [deltaCents, cfg.orgId]);
        await q("insert into wallet_ledger(id,org_id,kind,amount_cents,meta) values ($1,$2,'refund',$3,$4)",
          [uuid(), cfg.orgId, deltaCents, { reason:"upgrade_provider_error", from: cfg.fromQuality, to: cfg.toQuality }]);
      });
      return res.status(502).json({ error: "Upgrade generation failed" });
    }
  }

  return res.status(400).json({ error: "Nothing to upgrade" });
});
export default r;

