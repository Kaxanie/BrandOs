import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db";
import { estimateExportCostUSD } from "../services/pricing";
import { getMonthlyUsage } from "../services/usage";

const Body = z.object({
	orgId: z.string().uuid(),
	quality: z.enum(["low", "medium", "high"]),
	n: z.number().int().min(1).max(10)
});

const r = Router();

r.post("/quote", async (req, res) => {
	const cfg = Body.parse(req.body);
	const org = await db.one("select id, reservation from orgs where id=$1", [cfg.orgId]);
	const { usage } = await getMonthlyUsage(cfg.orgId);
	const q = estimateExportCostUSD({
		quality: cfg.quality,
		n: cfg.n,
		finalsMediumSoFar: usage.finals_medium ?? 0,
		reservation: !!org.reservation
	});
	res.json({ unitUSD: q.unit, totalUSD: q.total, band: q.band });
});

export default r;

