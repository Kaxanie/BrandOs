import React from "react";
import { View, ScrollView, TextInput, Text, Button } from "react-native";
import { useAtom } from "jotai";
import { brandOverviewAtom, typographyAtom, paletteAtom, symbolismAtom, brandIntegrationAtom } from "../store";
import { useNavigation } from "@react-navigation/native";

export default function BrandSetup(){
  const nav = useNavigation<any>();
  const [overview, setOverview] = useAtom(brandOverviewAtom);
  const [typo, setTypo] = useAtom(typographyAtom);
  const [pal, setPal] = useAtom(paletteAtom);
  const [sym, setSym] = useAtom(symbolismAtom);
  const [bi, setBI] = useAtom(brandIntegrationAtom);

  return (
    <ScrollView contentContainerStyle={{padding:16, gap:12}}>
      <Text>Brand Overview</Text>
      <TextInput placeholder="Tagline" value={overview.tagline} onChangeText={t=>setOverview({...overview,tagline:t})} />
      <TextInput placeholder="Essence" value={overview.essence} onChangeText={t=>setOverview({...overview,essence:t})} />
      <Text>Typography</Text>
      <TextInput placeholder="Logo type" value={typo.logo} onChangeText={t=>setTypo({...typo,logo:t})} />
      <Button title="Next" onPress={()=>nav.navigate("ModeSelect")} />
    </ScrollView>
  );
}

