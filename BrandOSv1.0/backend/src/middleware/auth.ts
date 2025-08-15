import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export interface AuthedRequest extends Request {
	userId?: string;
	orgId?: string;
}

export const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
	const header = req.headers.authorization || "";
	const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
	if (!token) return res.status(401).json({ error: "No token" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
		req.userId = decoded.userId;
		req.orgId = decoded.orgId;
		return next();
	} catch {
		return res.status(401).json({ error: "Invalid token" });
	}
};

