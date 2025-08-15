import { getBand, unitPriceUSD, type BandInfo } from "./pricing";

test("bands escalate correctly", () => {
  expect(getBand(0, false).bandPriceMedium).toBe(0.12);
  expect(getBand(2500, false).bandPriceMedium).toBe(0.11);
  expect(getBand(15000, false).bandPriceMedium).toBe(0.1);
  expect(getBand(60000, false).bandPriceMedium).toBe(0.095);
  expect(getBand(10, true).bandPriceMedium).toBe(0.085);
});

test("unit price by quality", () => {
  const base: BandInfo = { bandPriceMedium: 0.12 as 0.12, reason: "base" };
  expect(unitPriceUSD("medium", base)).toBe(0.12);
  expect(unitPriceUSD("low", base)).toBe(0.04);
  expect(unitPriceUSD("high", base)).toBe(0.48);
});

