import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db";

const r = Router();

r.get("/wallet/:orgId", async (req, res) => {
  const orgId = req.params.orgId;
  const w = await db.oneOrNone("select balance_cents from wallets where org_id=$1", [orgId]);
  res.json({ balance_cents: w?.balance_cents ?? 0 });
});

export default r;

