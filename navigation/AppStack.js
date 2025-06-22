import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { HomeScreen, MealCameraScreen, MealAnalysisScreen } from "../screens";
import LogMealScreen from '../screens/LogMealScreen';

const Stack = createStackNavigator();

export const AppStack = () => {
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
