import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Onboard from "./screens/Onboard";
import BrandSetup from "./screens/BrandSetup";
import ModeSelect from "./screens/ModeSelect";
import PromptOnly from "./screens/PromptOnly";
import Replicate from "./screens/Replicate";
import QuoteAlternator from "./screens/QuoteAlternator";
import QuoteScreen from "./screens/Quote";
import GenerateScreen from "./screens/Generate";

const Stack = createNativeStackNavigator();
export default function App(){
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Onboard" component={Onboard} />
        <Stack.Screen name="BrandSetup" component={BrandSetup} />
        <Stack.Screen name="ModeSelect" component={ModeSelect} />
        <Stack.Screen name="PromptOnly" component={PromptOnly} />
        <Stack.Screen name="Replicate" component={Replicate} />
        <Stack.Screen name="QuoteAlternator" component={QuoteAlternator} />
        <Stack.Screen name="Quote" component={QuoteScreen} />
        <Stack.Screen name="Generate" component={GenerateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

