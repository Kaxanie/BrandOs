import React, { useMemo, useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { useAtom } from "jotai";
import { brandOverviewAtom, typographyAtom, paletteAtom, symbolismAtom, brandIntegrationAtom, orgIdAtom, aspectAtom, qualityAtom, nAtom } from "../store";
import { AspectQuality } from "../components/AspectQuality";
import { useNavigation } from "@react-navigation/native";

export default function PromptOnly(){
  const nav = useNavigation<any>();
  const [brief, setBrief] = useState("");
  const [orgId] = useAtom(orgIdAtom);
  const [aspect, setAspect] = useAtom(aspectAtom);
  const [quality, setQuality] = useAtom(qualityAtom);
  const [n, setN] = useAtom(nAtom);

  const [overview] = useAtom(brandOverviewAtom);
  const [typo] = useAtom(typographyAtom);
  const [pal] = useAtom(paletteAtom);
  const [sym] = useAtom(symbolismAtom);
  const [bi] = useAtom(brandIntegrationAtom);

  const compiledPrompt = useMemo(()=>{
    return [
      `BRAND OVERVIEW`,
      `• Tagline: "${overview.tagline}"`,
      `• Essence: ${overview.essence}`,
      `• Tone of Voice: ${overview.tone?.join(", ")}`,
      `• Audience: ${overview.audience}`,
      ``,
      `TYPOGRAPHY`,
      `• Logo: ${typo.logo}`,
      `• Headlines: ${typo.headline} • Body: ${typo.body} • Accents: ${typo.accent}`,
      ``,
      `AESTHETIC DNA`,
      `• Textures: ... • Styling: ... • Elements: ... • People: ...`,
      ``,
      `COLOR PALETTE`,
      `• Primary Trio: ${pal.primaryTrio.map(p=>`${p.name} ${p.hex}`).join(", ")}`,
      `• Neutrals: ${pal.neutrals.map(n=>`${n.name} ${n.hex}`).join(", ")}`,
      ``,
      `SYMBOLISM`,
      `• ${sym.motifs.join(", ")}`,
      ``,
      `BRAND INTEGRATION`,
      `• Allowed marks: ${bi.allowedMarks.join(", ")} • Max placements: ${bi.maxBrandPlacements}`,
      ``,
      `GLOBAL "3%" MANDATE: subtle on-brand intervention only; realism preserved.`,
      ``,
      `BRIEF: ${brief}`
    ].join("\n");
  }, [brief, overview, typo, pal, sym, bi]);

  return (
    <View style={{padding:16, gap:12}}>
      <Text>Describe what to generate</Text>
      <TextInput multiline numberOfLines={6} value={brief} onChangeText={setBrief} style={{borderWidth:1, borderColor:"#ccc", padding:8}} />
      <AspectQuality aspect={aspect} setAspect={setAspect} quality={quality} setQuality={setQuality} n={n} setN={setN} />
      <Button title="Quote & Generate" onPress={()=>nav.navigate("Quote", { compiledPrompt, images: [] })} />
    </View>
  );
}

