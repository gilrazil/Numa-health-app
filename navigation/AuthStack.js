import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";

console.log("[AUTH] 🏗️ AuthStack module loaded");

import { 
  LoginScreen, 
  SignupScreen, 
  ForgotPasswordScreen,
  WelcomeScreen,
  GenderScreen,
  AgeHeightWeightScreen,
  GoalScreen
} from "../screens";
import { FirstLaunchService } from "../services/FirstLaunchService";

console.log("[AUTH] 📦 AuthStack imports loaded successfully");

const Stack = createStackNavigator();
console.log("[AUTH] 🗂️ Stack navigator created");

export const AuthStack = () => {
  console.log("[AUTH] 🚀 AuthStack component called");
  
  const [initialRoute, setInitialRoute] = React.useState('Welcome');
  const [isLoading, setIsLoading] = React.useState(true);

  console.log("[AUTH] 🎯 AuthStack state initialized - initialRoute: 'Welcome', isLoading: true");

  React.useEffect(() => {
    console.log("[AUTH] ⚡ AuthStack useEffect triggered");
    console.log("[AUTH] 🔄 About to determine initial route");
    determineInitialRoute();
  }, []);

  const determineInitialRoute = async () => {
    console.log("[AUTH] 🎯 determineInitialRoute called");
    
    try {
      console.log("[AUTH] 🔍 Getting user experience type from FirstLaunchService");
      const experienceType = await FirstLaunchService.getUserExperienceType();
      
      console.log('[AUTH] 🎯 Auth Experience Type:', experienceType);

      // Simple routing based on user experience  
      if (experienceType === 'returning') {
        // Returning user - go to login
        console.log("[AUTH] 👋 Returning user detected - setting route to Login");
        setInitialRoute('Login');
        console.log('[AUTH] 👋 Returning user detected - showing Login screen');
      } else if (experienceType === 'incomplete') {
        // User started onboarding but didn't finish - show welcome with different messaging
        console.log("[AUTH] ⏳ Incomplete onboarding detected - setting route to Welcome");
        setInitialRoute('Welcome');
        console.log('[AUTH] ⏳ Incomplete onboarding detected - showing Welcome screen');
      } else {
        // First time user - normal welcome flow
        console.log("[AUTH] 🆕 First time user - setting route to Welcome");
        setInitialRoute('Welcome');
        console.log('[AUTH] 🆕 First time user - showing Welcome screen');
      }
    } catch (error) {
      console.error('[AUTH] 🔥 Error determining initial route:', error);
      console.error('[AUTH] 🔥 Error stack:', error.stack);
      console.log("[AUTH] 🛡️ Setting fallback route to Welcome");
      setInitialRoute('Welcome'); // Safe fallback
    } finally {
      console.log("[AUTH] ✅ Setting isLoading to false");
      setIsLoading(false);
    }
  };

  console.log("[AUTH] 🎨 AuthStack render cycle - isLoading:", isLoading, "initialRoute:", initialRoute);

  if (isLoading) {
    console.log("[AUTH] ⏳ AuthStack still loading, returning null");
    return null; // Could show a splash screen here
  }

  console.log("[AUTH] 🎉 AuthStack ready to render Stack.Navigator with initialRoute:", initialRoute);

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
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
