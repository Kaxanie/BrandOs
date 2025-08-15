export type Quality = "low" | "medium" | "high";
export type Aspect = "1:1" | "2:3" | "3:2";
export type VolumeBand = 0.12 | 0.11 | 0.1 | 0.095 | 0.085;

export interface BandInfo {
	bandPriceMedium: VolumeBand;
	reason: "base" | "2k" | "10k" | "50k" | "reservation";
}

export function getBand(finalsMediumThisMonth: number, hasReservation: boolean): BandInfo {
	if (hasReservation) return { bandPriceMedium: 0.085, reason: "reservation" } as const;
	if (finalsMediumThisMonth >= 50000) return { bandPriceMedium: 0.095, reason: "50k" } as const;
	if (finalsMediumThisMonth >= 10000) return { bandPriceMedium: 0.1, reason: "10k" } as const;
	if (finalsMediumThisMonth >= 2000) return { bandPriceMedium: 0.11, reason: "2k" } as const;
	return { bandPriceMedium: 0.12, reason: "base" } as const;
}

export function unitPriceUSD(q: Quality, band: BandInfo): number {
	const m = band.bandPriceMedium;
	if (q === "medium") return m;
	if (q === "low") return +(m * 0.33).toFixed(2);
	return +(m * 4).toFixed(2);
}

export function estimateExportCostUSD({
	quality,
	n,
	finalsMediumSoFar,
	reservation
}: {
	quality: Quality;
	n: number;
	finalsMediumSoFar: number;
	reservation: boolean;
}) {
	const band = getBand(finalsMediumSoFar, reservation);
	const unit = unitPriceUSD(quality, band);
	const total = +(unit * n).toFixed(2);
	return { unit, total, band };
}

