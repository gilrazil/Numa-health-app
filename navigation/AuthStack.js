import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import { 
  LoginScreen, 
  SignupScreen, 
  ForgotPasswordScreen,
  WelcomeScreen,
  GenderScreen,
  AgeHeightWeightScreen,
  GoalScreen
} from "../screens";

const Stack = createStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="AgeHeightWeight" component={AgeHeightWeightScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
