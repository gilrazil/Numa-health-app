import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { 
  HomeScreen, 
  MealCameraScreen, 
  MealAnalysisScreen, 
  CameraScreen 
} from "../screens";
import LogMealScreen from '../screens/LogMealScreen';
import { log } from '../utils/logger';

log("[APP] 🏗️ AppStack module loaded");
log("[APP] 📦 AppStack imports loaded successfully");

const Stack = createStackNavigator();
log("[APP] 🗂️ AppStack navigator created");

export const AppStack = () => {
  log("[APP] 🚀 AppStack component called");
  log("[APP] 🎉 AppStack ready to render Stack.Navigator");
  
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
        name="Camera" 
        component={CameraScreen}
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
