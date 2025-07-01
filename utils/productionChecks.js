import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log, logError } from './logger';

// Comprehensive production environment checker
export const runProductionChecks = async () => {
  log('🔍 PRODUCTION CHECKS: Starting comprehensive environment verification...');
  
  const checks = {
    platform: Platform.OS,
    isProduction: !__DEV__,
    timestamp: new Date().toISOString(),
    checks: {}
  };

  try {
    // 1. Environment Variables Check
    log('🔍 Checking environment variables...');
    checks.checks.envVars = {
      hasOpenAI: !!process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'unknown'
    };

    // 2. Firebase Config Check
    log('🔍 Checking Firebase configuration...');
    try {
      const { auth, db, validateFirebaseServices } = require('../config/firebase');
      
      // Run Firebase validation
      const validation = validateFirebaseServices();
      
      checks.checks.firebase = {
        authAvailable: !!auth,
        dbAvailable: !!db,
        configLoaded: true,
        validation: validation
      };
    } catch (firebaseError) {
      checks.checks.firebase = {
        error: firebaseError.message,
        configLoaded: false
      };
    }

    // 3. AsyncStorage Check
    log('🔍 Checking AsyncStorage availability...');
    try {
      await AsyncStorage.setItem('productionCheck', 'test');
      await AsyncStorage.getItem('productionCheck');
      await AsyncStorage.removeItem('productionCheck');
      checks.checks.asyncStorage = { available: true };
    } catch (storageError) {
      checks.checks.asyncStorage = { 
        available: false, 
        error: storageError.message 
      };
    }

    // 4. Metro Config Verification
    log('🔍 Checking require.context availability...');
    try {
      // Test if require.context is available (should be with unstable_allowRequireContext)
      if (typeof require.context === 'function') {
        checks.checks.requireContext = { available: true };
      } else {
        checks.checks.requireContext = { 
          available: false, 
          error: 'require.context not available' 
        };
      }
    } catch (contextError) {
      checks.checks.requireContext = { 
        available: false, 
        error: contextError.message 
      };
    }

    // 5. Assets and Fonts Check
    log('🔍 Checking critical assets...');
    try {
      const Images = require('../config/images');
      checks.checks.assets = {
        imagesConfigLoaded: !!Images,
        hasImages: Object.keys(Images || {}).length > 0
      };
    } catch (assetsError) {
      checks.checks.assets = {
        imagesConfigLoaded: false,
        error: assetsError.message
      };
    }

    // 6. Navigation Config Check
    log('🔍 Checking navigation configuration...');
    try {
      const RootNavigator = require('../navigation/RootNavigator');
      checks.checks.navigation = {
        rootNavigatorLoaded: !!RootNavigator.RootNavigator
      };
    } catch (navError) {
      checks.checks.navigation = {
        rootNavigatorLoaded: false,
        error: navError.message
      };
    }

    // 7. Theme and Colors Check
    log('🔍 Checking theme configuration...');
    try {
      const Colors = require('../config/theme');
      checks.checks.theme = {
        colorsLoaded: !!Colors.Colors,
        hasColors: Object.keys(Colors.Colors || {}).length > 0
      };
    } catch (themeError) {
      checks.checks.theme = {
        colorsLoaded: false,
        error: themeError.message
      };
    }

    // 8. Component Imports Check
    log('🔍 Checking critical component imports...');
    try {
      const Components = require('../components');
      checks.checks.components = {
        indexLoaded: true,
        hasErrorBoundary: !!Components.ErrorBoundary,
        hasNavigationErrorFallback: !!Components.NavigationErrorFallback
      };
    } catch (componentError) {
      checks.checks.components = {
        indexLoaded: false,
        error: componentError.message
      };
    }

    log('🔍 PRODUCTION CHECKS COMPLETED:');
    log(JSON.stringify(checks, null, 2));
    
    return checks;

  } catch (error) {
    logError('🔥 PRODUCTION CHECKS FAILED:', error);
    checks.checks.overallError = error.message;
    return checks;
  }
};

// Check for Hermes-specific issues
export const checkHermesIssues = () => {
  log('🔍 HERMES CHECK: Verifying JavaScript engine...');
  
  const hermesInfo = {
    isHermes: typeof HermesInternal !== 'undefined',
    engine: typeof HermesInternal !== 'undefined' ? 'Hermes' : 'JSC',
    timestamp: new Date().toISOString()
  };

  if (hermesInfo.isHermes) {
    log('🔍 HERMES: Engine is Hermes');
    
    // Check for common Hermes issues
    try {
      // Test JSON operations
      const testObj = { test: 'value', number: 123 };
      JSON.stringify(testObj);
      JSON.parse(JSON.stringify(testObj));
      hermesInfo.jsonSupport = true;
    } catch (jsonError) {
      hermesInfo.jsonSupport = false;
      hermesInfo.jsonError = jsonError.message;
    }

    // Test async operations
    try {
      Promise.resolve().then(() => {});
      hermesInfo.promiseSupport = true;
    } catch (promiseError) {
      hermesInfo.promiseSupport = false;
      hermesInfo.promiseError = promiseError.message;
    }
  } else {
    log('🔍 ENGINE: Using JavaScriptCore (JSC)');
  }

  log('🔍 ENGINE INFO:', JSON.stringify(hermesInfo, null, 2));
  return hermesInfo;
}; 