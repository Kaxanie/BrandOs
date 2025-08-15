import express from "express";
import cors from "cors";
import health from "./routes/health";
import quote from "./routes/quote";
import generate from "./routes/generate";
import keep from "./routes/keep";
import iapApple from "./routes/iap-apple";
import iapGoogle from "./routes/iap-google";
import wallet from "./routes/wallet";

import { requireAuth } from "./middleware/auth";
import { rateLimit } from "./middleware/rateLimiter";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use(health);
app.use((req,res,next)=>{ if (req.path === "/health") return next(); return requireAuth(req as any, res, next); });
app.use("/quote", rateLimit("quote"));
app.use(quote);
app.use("/generate", rateLimit("generate"));
app.use(generate);
app.use(keep);
app.use("/iap", iapApple);
app.use("/iap", iapGoogle);
app.use(wallet);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend on :${PORT}`));

