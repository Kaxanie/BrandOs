import express from "express";
import cors from "cors";
import health from "./routes/health";
import quote from "./routes/quote";
import generate from "./routes/generate";
import keep from "./routes/keep";
import iapApple from "./routes/iap-apple";
import iapGoogle from "./routes/iap-google";
import wallet from "./routes/wallet";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use(health);
app.use(quote);
app.use(generate);
app.use(keep);
app.use("/iap", iapApple);
app.use("/iap", iapGoogle);
app.use(wallet);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend on :${PORT}`));

