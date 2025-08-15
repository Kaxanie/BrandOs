import React from "react";
import { ScrollView, Image, View, Dimensions } from "react-native";
import ExportPanel from "../components/ExportPanel";

export default function GenerateScreen({ route }: any){
  const { images } = route.params as { images: { mimeType:string; base64:string }[] };
  const w = Dimensions.get("window").width - 32;
  return (
    <ScrollView contentContainerStyle={{padding:16, gap:16}}>
      {images.map((img,i)=>(
        <Image key={i} source={{ uri: `data:${img.mimeType};base64,${img.base64}` }} style={{ width:w, height:w, borderWidth:1, borderColor:"#eee" }} />
      ))}
      <ExportPanel images={images} />
    </ScrollView>
  );
}

