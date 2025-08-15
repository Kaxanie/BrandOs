import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { db } from "../lib/db";

const r = Router();

const AppleBody = z.object({ orgId: z.string().uuid(), jws: z.string() });
r.post("/iap/apple/verify", async (req,res)=>{
  const { orgId, jws } = AppleBody.parse(req.body);
  // TODO: verify JWS with App Store Server API
  const amountCents = 499; // example pack
  await db.none("insert into wallets(org_id,balance_cents) values($1,$2) on conflict(org_id) do update set balance_cents=wallets.balance_cents+$2",
    [orgId, amountCents]);
  await db.none("insert into wallet_ledger(id,org_id,kind,amount_cents,meta) values ($1,$2,'topup',$3,$4)",
    [uuid(), orgId, amountCents, { provider:"apple" }]);
  res.json({ ok:true, creditedCents: amountCents });
});
export default r;

