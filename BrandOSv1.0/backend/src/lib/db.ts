import { Pool } from "pg";

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = {
	oneOrNone: async (q: string, params: any[] = []) =>
		(await pool.query(q, params)).rows[0] ?? null,
	one: async (q: string, params: any[] = []) =>
		(await pool.query(q, params)).rows[0],
	manyOrNone: async (q: string, params: any[] = []) =>
		(await pool.query(q, params)).rows,
	none: async (q: string, params: any[] = []) => void (await pool.query(q, params))
};

export async function withTx<T>(fn: (q: (sql: string, params?: any[]) => Promise<any>) => Promise<T>): Promise<T> {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const q = (sql: string, params: any[] = []) => client.query(sql, params);
		const result = await fn(q);
		await client.query("COMMIT");
		return result;
	} catch (err) {
		try { await client.query("ROLLBACK"); } catch {}
		throw err;
	} finally {
		client.release();
	}
}

