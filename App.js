import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Platform, LogBox, ScrollView } from "react-native";
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { AuthenticatedUserProvider, AuthenticatedUserContext } from "./providers";

// 🔧 SIMPLE ON-SCREEN LOGGING SYSTEM
const DEBUG_LOGS = []; // Simple array to store logs

// Override console.log to capture messages for on-screen display
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Simple log storage
const addLog = (level, ...args) => {
  const timestamp = new Date().toLocaleTimeString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  const logEntry = `[${timestamp}] ${level}: ${message}`;
  DEBUG_LOGS.push(logEntry);
  
  // Keep only last 50 logs
  if (DEBUG_LOGS.length > 50) {
    DEBUG_LOGS.shift();
  }
  
  // Still call original console methods
  if (level === 'LOG') originalConsoleLog(...args);
  else if (level === 'ERROR') originalConsoleError(...args);
  else if (level === 'WARN') originalConsoleWarn(...args);
};

// Override console methods
console.log = (...args) => addLog('LOG', ...args);
console.error = (...args) => addLog('ERROR', ...args);
console.warn = (...args) => addLog('WARN', ...args);

/*
 * BUILD 23 STRATEGY: Option 1 - AuthenticatedUserProvider Test
 * 
 * This build implements Option 1 from the systematic debugging approach:
 * - Test ONLY the AuthenticatedUserProvider component
 * - No complex navigation dependencies (NavigationContainer, AuthStack, AppStack)
 * - Simple green screen with auth context display
 * - Fixes Build 21's white screen issue (missing auth prop)
 * - Incremental testing: Add one component at a time to isolate breaking changes
 * 
 * Previous builds:
 * - Build 20: ✅ Working debug screen (baseline)
 * - Build 21: ❌ White screen (missing auth prop in AuthenticatedUserProvider)
 * - Build 22: ✅ Internal distribution (preview profile)
 * - Build 23: 🧪 TestFlight production build (Option 1 strategy)
 */

// Add comprehensive logging for startup diagnostics
console.log("[INIT] 🚀 App.js mounted - Starting Build 23 diagnostic logging");
console.log("[INIT] 📱 Platform:", Platform.OS);
console.log("[INIT] 🔧 Environment:", __DEV__ ? 'Development' : 'Production');
console.log("[INIT] ⏰ Timestamp:", new Date().toISOString());
console.log("[INIT] 🎯 Build 23 Debug Mode: ENABLED");

// Global error handler to catch JS errors that happen before rendering (Expo Go compatible)
console.log("[INIT] 🛡️ Setting up global error handler");
if (global.ErrorUtils?.setGlobalHandler) {
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error("[GLOBAL ERROR] 🔥 Unhandled JavaScript error caught:");
    console.error("[GLOBAL ERROR] 📝 Message:", error.message);
    console.error("[GLOBAL ERROR] 📚 Stack:", error.stack);
    console.error("[GLOBAL ERROR] ⚠️ Is Fatal:", isFatal);
    console.error("[GLOBAL ERROR] 🎯 Error Name:", error.name);
    console.error("[GLOBAL ERROR] ⏰ Timestamp:", new Date().toISOString());
    
    // Log additional error details if available
    if (error.componentStack) {
      console.error("[GLOBAL ERROR] 🔧 Component Stack:", error.componentStack);
    }
    
    // For development, we still want to see the error
    if (__DEV__) {
      console.log("[GLOBAL ERROR] 🚨 Development mode - error will still be thrown");
    }
  });
  console.log("[INIT] ✅ Global error handler configured successfully");
} else {
  console.log("[INIT] ⚠️ ErrorUtils not available in this environment (Expo Go)");
}

// Temporarily ignore all logs to reduce noise during debugging
LogBox.ignoreAllLogs();

console.log("[INIT] 📦 Minimal imports loaded for auth provider test");
console.log("[INIT] 🔥 About to test Firebase initialization");

// Firebase configuration with iOS native API key (working from Build 20)
const firebaseConfig = {
  apiKey: "AIzaSyCF8WSck4p793ZjWETvvfiQ7EXng8FTmMM",
  authDomain: "numa-app-34ede.firebaseapp.com",
  projectId: "numa-app-34ede",
  storageBucket: "numa-app-34ede.firebasestorage.app",
  messagingSenderId: "650800257848",
  appId: "1:650800257848:ios:4baae90c17dc1f9ad52a1a"
};

console.log("[FIREBASE] 🔑 Firebase config loaded");
console.log("[FIREBASE] 🔑 API Key exists:", !!firebaseConfig.apiKey);
console.log("[FIREBASE] 🔑 Project ID:", firebaseConfig.projectId);

// Test Firebase basic initialization
console.log("[FIREBASE] 🚀 Starting Firebase initialization");
let firebaseApp = null;
let auth = null;
try {
  firebaseApp = initializeApp(firebaseConfig);
  console.log("[FIREBASE] ✅ Firebase initialized successfully");
  console.log("[FIREBASE] 📱 App name:", firebaseApp.name);
  console.log("[FIREBASE] ⚙️ App options exist:", !!firebaseApp.options);
  
  // Initialize Firebase Auth
  console.log("[FIREBASE] 🔐 Initializing Firebase Auth...");
  auth = getAuth(firebaseApp);
  console.log("[FIREBASE] ✅ Firebase Auth initialized successfully");
  console.log("[FIREBASE] 🔗 Auth app reference:", !!auth.app);
} catch (err) {
  console.error("[FIREBASE] ❌ Firebase init failed:", err.message);
  console.error("[FIREBASE] 🔥 Firebase error details:", err);
}

console.log("[INIT] 🧪 Build 23 - Option 1: AuthenticatedUserProvider Test Strategy");
console.log("[INIT] 🎯 Testing ONLY AuthenticatedUserProvider (no navigation dependencies)");
console.log("[INIT] 🔧 Removed all unnecessary imports and dependencies for clean auth test");

// AUTH TEST COMPONENT - Build 23 Addition
const AuthTest = () => {
  console.log("[AUTH TEST] 🧪 AuthTest component rendered");
  
  const { user, isLoading } = React.useContext(AuthenticatedUserContext);
  console.log("[AUTH TEST] 👤 User from context:", user ? `Found (${user.email || user.uid})` : 'NONE');
  console.log("[AUTH TEST] ⏳ Loading state:", isLoading);
  
  return (
    <View style={{
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: 'lightgreen',
      padding: 20
    }}>
      <Text style={{fontSize: 24, fontWeight: 'bold', textAlign: 'center'}}>
        AUTH TEST - BUILD 23
      </Text>
      <Text style={{fontSize: 18, marginTop: 15, textAlign: 'center'}}>
        Loading: {isLoading ? 'YES' : 'NO'}
      </Text>
      <Text style={{fontSize: 18, marginTop: 10, textAlign: 'center'}}>
        User: {user ? `Found (${user.email || user.uid})` : 'NONE'}
      </Text>
      <Text style={{fontSize: 14, marginTop: 20, textAlign: 'center', color: '#333'}}>
        If you see this green screen with auth info, the provider works!
      </Text>
      <Text style={{fontSize: 12, marginTop: 15, textAlign: 'center', color: '#666'}}>
        Build 23: Option 1 - AuthenticatedUserProvider Test Strategy
      </Text>
    </View>
  );
};

// Simple component to display logs directly on screen
const SimpleLogDisplay = () => {
  const [, forceUpdate] = useState(0);
  
  // Force re-render every second to show new logs
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.logContainer}>
      <Text style={styles.logTitle}>🔧 BUILD 23 DEBUG LOGS</Text>
      <ScrollView style={styles.logScrollView}>
        {DEBUG_LOGS.map((log, index) => (
          <Text key={index} style={[
            styles.logText,
            log.includes('ERROR') ? styles.logError : 
            log.includes('WARN') ? styles.logWarn : styles.logInfo
          ]}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

// Build 23 Test Navigator - Simple auth test instead of complex navigation
const Build23TestNavigator = () => {
  console.log("[TEST NAV] 🧪 Build23TestNavigator component called");
  console.log("[TEST NAV] 🎯 Testing auth provider with simple component");
  
  try {
    return <AuthTest />;
  } catch (error) {
    console.error("[TEST NAV] 🔥 Error rendering AuthTest:", error);
    console.error("[TEST NAV] 🔥 AuthTest error stack:", error.stack);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>AuthTest Error</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }
};

console.log("[INIT] 🧪 Build23TestNavigator component defined");

const App = () => {
  console.log("[INIT] 🔄 App component function called");
  console.log("[INIT] ✅ Build 23 debug mode active");
  console.log("[INIT] 📱 Platform:", Platform.OS);
  console.log("[INIT] 🧭 About to test navigation components");
  
  // Add test logs
  console.warn("[TEST] ⚠️ Build 23 test warning");
  console.error("[TEST] ❌ Build 23 test error");
  
  console.log("[INIT] 🚀 About to render AuthenticatedUserProvider test (no NavigationContainer)");
  console.log("[INIT] 🔐 Auth instance status for provider:", auth ? 'Available' : 'Not available');
  
  // Split screen: Navigation on top, logs on bottom
  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.appContainer}>
        {/* Navigation Section */}
        <View style={styles.navigationContainer}>
          <AuthenticatedUserProvider auth={auth}>
            <Build23TestNavigator />
          </AuthenticatedUserProvider>
        </View>
        
        {/* Debug Logs Section */}
        <View style={styles.debugSection}>
          <SimpleLogDisplay />
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  appContainer: {
    flex: 1,
  },
  navigationContainer: {
    flex: 2, // Takes up 2/3 of the screen
    backgroundColor: '#ffffff',
  },
  debugSection: {
    flex: 1, // Takes up 1/3 of the screen
    backgroundColor: '#000000',
    borderTopWidth: 2,
    borderTopColor: '#00ff00',
  },
  // Loading/Error styles for RealAppNavigator
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',  
    color: '#2196F3',
    marginBottom: 8,
  },
  statusDetails: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  // Debug log styles
  logContainer: {
    flex: 1,
    padding: 10,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 5,
    textAlign: 'center',
  },
  logScrollView: {
    flex: 1,
  },
  logText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 1,
    lineHeight: 12,
  },
  logInfo: {
    color: '#00ff00',
  },
  logWarn: {
    color: '#ffaa00',
  },
  logError: {
    color: '#ff4444',
  },
});

export default App; 