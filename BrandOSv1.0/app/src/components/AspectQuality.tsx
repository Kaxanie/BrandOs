import React from "react";
import { View, Text, Pressable } from "react-native";

export function AspectQuality({
  aspect, setAspect, quality, setQuality, n, setN
}:{ aspect:"1:1"|"2:3"|"3:2"; setAspect:(a:any)=>void;
   quality:"low"|"medium"|"high"; setQuality:(q:any)=>void;
   n:number; setN:(v:number)=>void; }) {
  return (
    <View style={{gap:8}}>
      <Text>Aspect</Text>
      <View style={{flexDirection:"row", gap:8}}>
        {["1:1","2:3","3:2"].map(a=>(
          <Pressable key={a} onPress={()=>setAspect(a as any)} style={{padding:8, borderWidth:1, borderColor: aspect===a ? "#000":"#ccc"}}>
            <Text>{a}</Text>
          </Pressable>
        ))}
      </View>
      <Text>Quality</Text>
      <View style={{flexDirection:"row", gap:8}}>
        {["low","medium","high"].map(q=>(
          <Pressable key={q} onPress={()=>setQuality(q as any)} style={{padding:8, borderWidth:1, borderColor: quality===q ? "#000":"#ccc"}}>
            <Text>{q}</Text>
          </Pressable>
        ))}
      </View>
      <Text>Variations (n)</Text>
      <View style={{flexDirection:"row", gap:8}}>
        {[1,2,3,4].map(v=>(
          <Pressable key={v} onPress={()=>setN(v)} style={{padding:8, borderWidth:1, borderColor: n===v ? "#000":"#ccc"}}>
            <Text>{v}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

