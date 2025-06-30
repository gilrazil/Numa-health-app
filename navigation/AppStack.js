import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { HomeScreen, MealCameraScreen, MealAnalysisScreen } from "../screens";
import LogMealScreen from '../screens/LogMealScreen';

console.log("[APP] 🏗️ AppStack module loaded");
console.log("[APP] 📦 AppStack imports loaded successfully");

const Stack = createStackNavigator();
console.log("[APP] 🗂️ AppStack navigator created");

export const AppStack = () => {
  console.log("[APP] 🚀 AppStack component called");
  console.log("[APP] 🎉 AppStack ready to render Stack.Navigator");
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MealCamera" 
        component={MealCameraScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MealAnalysis" 
        component={MealAnalysisScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="LogMeal" component={LogMealScreen} />
    </Stack.Navigator>
  );
};
