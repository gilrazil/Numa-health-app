import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { log, logError, logWarn } from '../utils/logger';

log("[AUTH] 🏗️ AuthStack module loaded");

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

log("[AUTH] 📦 AuthStack imports loaded successfully");

const Stack = createStackNavigator();
log("[AUTH] 🗂️ Stack navigator created");

export const AuthStack = () => {
  log("[AUTH] 🚀 AuthStack component called");
  
  const [initialRoute, setInitialRoute] = React.useState('Welcome');
  const [isLoading, setIsLoading] = React.useState(true);

  log("[AUTH] 🎯 AuthStack state initialized - initialRoute: 'Welcome', isLoading: true");

  React.useEffect(() => {
    log("[AUTH] ⚡ AuthStack useEffect triggered");
    log("[AUTH] 🔄 About to determine initial route");
    determineInitialRoute();
  }, []);

  const determineInitialRoute = async () => {
    log("[AUTH] 🎯 determineInitialRoute called");
    
    try {
      log("[AUTH] 🔍 Getting user experience type from FirstLaunchService");
      const experienceType = await FirstLaunchService.getUserExperienceType();
      
      log('[AUTH] 🎯 Auth Experience Type:', experienceType);

      // Simple routing based on user experience  
      if (experienceType === 'returning') {
        // Returning user - go to login
        log("[AUTH] 👋 Returning user detected - setting route to Login");
        setInitialRoute('Login');
        log('[AUTH] 👋 Returning user detected - showing Login screen');
      } else if (experienceType === 'incomplete') {
        // User started onboarding but didn't finish - show welcome with different messaging
        log("[AUTH] ⏳ Incomplete onboarding detected - setting route to Welcome");
        setInitialRoute('Welcome');
        log('[AUTH] ⏳ Incomplete onboarding detected - showing Welcome screen');
      } else {
        // First time user - normal welcome flow
        log("[AUTH] 🆕 First time user - setting route to Welcome");
        setInitialRoute('Welcome');
        log('[AUTH] 🆕 First time user - showing Welcome screen');
      }
    } catch (error) {
      logError('[AUTH] 🔥 Error determining initial route:', error);
      logError('[AUTH] 🔥 Error stack:', error.stack);
      log("[AUTH] 🛡️ Setting fallback route to Welcome");
      setInitialRoute('Welcome'); // Safe fallback
    } finally {
      log("[AUTH] ✅ Setting isLoading to false");
      setIsLoading(false);
    }
  };

  log("[AUTH] 🎨 AuthStack render cycle - isLoading:", isLoading, "initialRoute:", initialRoute);

  if (isLoading) {
    log("[AUTH] ⏳ AuthStack still loading, returning null");
    return null; // Could show a splash screen here
  }

  log("[AUTH] 🎉 AuthStack ready to render Stack.Navigator with initialRoute:", initialRoute);

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
