import { atom } from "jotai";

export const orgIdAtom = atom<string>("11111111-1111-1111-1111-111111111111");
export const aspectAtom = atom<"1:1"|"2:3"|"3:2">("1:1");
export const qualityAtom = atom<"low"|"medium"|"high">("medium");
export const nAtom = atom<number>(1);

export const brandOverviewAtom = atom({ tagline:"", essence:"", tone:["RAW","MINIMAL"], audience:"CREATIVES" });
export const typographyAtom = atom({ logo:"FORGET SOCIETY", headline:"Playfair Display", body:"Inter", accent:"Courier New" });
export const paletteAtom = atom({
  primaryTrio: [{name:"Bitter Blue",hex:"#004aad"},{name:"Bruised Ego",hex:"#8065ab"},{name:"Rageful Skies",hex:"#d1090f"}],
  neutrals: [{name:"Dark Hinge",hex:"#35323a"},{name:"White Lies",hex:"#fafafa"},{name:"Membrane Cream",hex:"#f4f0d1"},{name:"Fake Drool",hex:"#acbfcb"}]
});
export const symbolismAtom = atom({ motifs: [] as string[] });
export const brandIntegrationAtom = atom({ name:"Forget Society", allowedMarks:["Forget Society","FRGT","frgtsociety"], maxBrandPlacements:2 });

