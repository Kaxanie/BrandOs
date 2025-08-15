import dayjs from "dayjs";
import { db } from "../lib/db";

export async function getMonthlyUsage(orgId: string, d = dayjs()) {
	const y = d.year(), m = d.month() + 1;
	const row = await db.oneOrNone(
		"select * from usage_monthly where org_id=$1 and y=$2 and m=$3",
		[orgId, y, m]
	);
	return { y, m, usage: row ?? { finals_medium: 0, finals_low: 0, finals_high: 0, previews_low: 0 } };
}

export async function incMonthly(
	orgId: string,
	y: number,
	m: number,
	field: "finals_medium" | "finals_low" | "finals_high",
	delta: number
) {
	await db.none(
		`
		insert into usage_monthly(org_id,y,m,${field})
		values ($1,$2,$3,$4)
		on conflict (org_id,y,m) do update set ${field}=usage_monthly.${field}+$4
		`,
		[orgId, y, m, delta]
	);
}

