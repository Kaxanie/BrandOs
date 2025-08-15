import type { Request, Response, NextFunction } from "express";
import { db } from "../lib/db";

const LIMITS = {
	generate: { perHour: 20, perDay: 100 },
	quote: { perHour: 100, perDay: 1000 }
} as const;

export const rateLimit = (endpoint: keyof typeof LIMITS) => {
	return async (req: Request & { orgId?: string }, res: Response, next: NextFunction) => {
		const orgId = req.orgId;
		if (!orgId) return res.status(401).json({ error: "unauthorized" });
		const now = new Date();
		const hourStart = new Date(now.getTime() - 60 * 60 * 1000);

		const row = await db.one(
			"SELECT COUNT(*)::int as count FROM rate_limits WHERE org_id=$1 AND endpoint=$2 AND created_at > $3",
			[orgId, endpoint, hourStart]
		);
		if (row.count >= LIMITS[endpoint].perHour) {
			return res.status(429).json({ error: "Rate limit exceeded" });
		}
		await db.none(
			"INSERT INTO rate_limits(org_id, endpoint, created_at) VALUES($1,$2,$3)",
			[orgId, endpoint, now]
		);
		next();
	};
};

