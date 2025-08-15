import * as Crypto from "expo-crypto";
export async function sha256(s:string){ return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, s); }

