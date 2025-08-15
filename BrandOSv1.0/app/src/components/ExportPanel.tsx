import React from "react";
import { View, Text, Button, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function ExportPanel({ images }:{ images: { mimeType:string; base64:string }[] }){
  const saveOne = async (idx:number)=>{
    const img = images[idx];
    const uri = FileSystem.cacheDirectory + `brandgen_${idx+1}.png`;
    await FileSystem.writeAsStringAsync(uri, img.base64, { encoding: FileSystem.EncodingType.Base64 });
    if (Platform.OS !== "web" && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  };
  return (
    <View style={{gap:8, marginTop:12}}>
      <Text>Export</Text>
      <Button title="Save first PNG" onPress={()=>saveOne(0)} />
    </View>
  );
}

