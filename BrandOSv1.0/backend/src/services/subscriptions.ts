export type Plan = "free" | "starter" | "pro" | "studio" | "agency";

export const PLAN_INCLUDED_STD: Record<Plan, number> = {
	free: 2,
	starter: 120,
	pro: 400,
	studio: 1200,
	agency: 3600
};

export function toStandardExports(q: "low" | "medium" | "high", count: number) {
	const factor = q === "low" ? 0.25 : q === "medium" ? 1 : 4;
	return factor * count;
}

