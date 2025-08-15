import React from "react";
import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Onboard(){
  const nav = useNavigation<any>();
  return (
    <View style={{padding:16, gap:12}}>
      <Text style={{fontSize:20, fontWeight:"600"}}>Branding OS</Text>
      <Text>Set up your brand system and generate on-brand visuals.</Text>
      <Button title="Get started" onPress={()=>nav.navigate("BrandSetup")}/>
    </View>
  );
}

