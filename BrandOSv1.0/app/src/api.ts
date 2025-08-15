import axios from "axios";
const BASE = process.env.EXPO_PUBLIC_API_BASE || "http://localhost:3000";

export async function quote(payload:{ orgId:string; quality:"low"|"medium"|"high"; n:number }){
  const { data } = await axios.post(`${BASE}/quote`, payload);
  return data as { unitUSD:number; totalUSD:number; band:{ bandPriceMedium:number; reason:string } };
}

export async function generate(payload:{
  orgId:string; mode:"final"; compiledPrompt:string;
  images?: {url:string}[]; n:number; aspect:"1:1"|"2:3"|"3:2";
  quality:"low"|"medium"|"high"; background?:"auto"|"transparent"|"opaque"; output_format?:"png"|"webp"|"jpeg";
}){
  const { data } = await axios.post(`${BASE}/generate`, payload, { maxBodyLength: 30e6 });
  return data as { images: { mimeType:string; base64:string }[], meta:any };
}

export async function iapAppleVerify(orgId:string, jws:string){
  const { data } = await axios.post(`${BASE}/iap/apple/verify`, { orgId, jws });
  return data;
}

