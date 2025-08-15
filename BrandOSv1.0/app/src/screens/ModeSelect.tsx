import React from "react";
import { View, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ModeSelect(){
  const nav = useNavigation<any>();
  return (
    <View style={{padding:16, gap:12}}>
      <Button title="Prompt Mode" onPress={()=>nav.navigate("PromptOnly")} />
      <Button title="Replication Mode" onPress={()=>nav.navigate("Replicate")} />
      <Button title="Quote Alternator" onPress={()=>nav.navigate("QuoteAlternator")} />
    </View>
  );
}

