import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert } from "react-native";
import { useAtom } from "jotai";
import { orgIdAtom, aspectAtom, qualityAtom, nAtom } from "../store";
import { quote, generate } from "../api";

export default function QuoteScreen({ route, navigation }: any){
  const { compiledPrompt, images } = route.params;
  const [orgId] = useAtom(orgIdAtom);
  const [aspect] = useAtom(aspectAtom);
  const [quality] = useAtom(qualityAtom);
  const [n] = useAtom(nAtom);

  const [unit, setUnit] = useState<number>();
  const [total, setTotal] = useState<number>();
  const [busy, setBusy] = useState(false);

  useEffect(()=>{
    (async ()=>{
      const q = await quote({ orgId, quality, n });
      setUnit(q.unitUSD); setTotal(q.totalUSD);
    })();
  }, [orgId, quality, n]);

  const onGenerate = async ()=>{
    setBusy(true);
    try {
      const r = await generate({
        orgId, mode:"final", compiledPrompt, images,
        n, aspect, quality, background: "auto", output_format: "png"
      });
      navigation.replace("Generate", { images: r.images });
    } catch(e:any){
      Alert.alert("Generation failed", String(e?.message || e));
    } finally { setBusy(false); }
  };

  if (unit==null) return <ActivityIndicator />;
  return (
    <View style={{padding:16, gap:12}}>
      <Text>Price: ${unit.toFixed(2)} × {n} = ${total?.toFixed(2)}</Text>
      <Button title="Generate" onPress={onGenerate} disabled={busy} />
    </View>
  );
}

