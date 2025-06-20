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
import { FirstLaunchService } from "../services/FirstLaunchService";
import { BiometricService } from "../services/BiometricService";

const Stack = createStackNavigator();

export const AuthStack = () => {
  const [initialRoute, setInitialRoute] = React.useState('Welcome');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    determineInitialRoute();
  }, []);

  const determineInitialRoute = async () => {
    try {
      const [experienceType, hasBiometric] = await Promise.all([
        FirstLaunchService.getUserExperienceType(),
        BiometricService.isBiometricEnabled()
      ]);
      
      console.log('🎯 Auth Experience Type:', experienceType);
      console.log('🔐 Has Biometric:', hasBiometric);

      // Smart routing based on user experience
      if (experienceType === 'returning' || hasBiometric) {
        // Returning user or has biometric - go straight to login
        setInitialRoute('Login');
        console.log('👋 Returning user detected - showing Login screen');
      } else if (experienceType === 'incomplete') {
        // User started onboarding but didn't finish - show welcome with different messaging
        setInitialRoute('Welcome');
        console.log('⏳ Incomplete onboarding detected - showing Welcome screen');
      } else {
        // First time user - normal welcome flow
        setInitialRoute('Welcome');
        console.log('🆕 First time user - showing Welcome screen');
      }
    } catch (error) {
      console.error('Error determining initial route:', error);
      setInitialRoute('Welcome'); // Safe fallback
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Could show a splash screen here
  }

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
