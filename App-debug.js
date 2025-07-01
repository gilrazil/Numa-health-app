import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Platform, LogBox, ScrollView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { AuthenticatedUserProvider, AuthenticatedUserContext } from "./providers";
import { AuthStack } from "./navigation/AuthStack";
import { AppStack } from "./navigation/AppStack";

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

// Add comprehensive logging for startup diagnostics
console.log("[INIT] 🚀 App.tsx mounted - Starting diagnostic logging");
console.log("[INIT] 📱 Platform:", Platform.OS);
console.log("[INIT] 🔧 Environment:", __DEV__ ? 'Development' : 'Production');
console.log("[INIT] ⏰ Timestamp:", new Date().toISOString());
console.log("[INIT] 🎯 Simple Debug Mode: ENABLED");

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

console.log("[INIT] 📦 Navigation imports loaded successfully");
console.log("[INIT] 🔥 About to test Firebase initialization");

// Firebase configuration (copied from config/firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyBwdZ-r61PbfPEE1UVQfTvAQMrBQhQGvC8",
  authDomain: "numa-app-34ede.firebaseapp.com",
  projectId: "numa-app-34ede",
  storageBucket: "numa-app-34ede.firebasestorage.app",
  messagingSenderId: "859592733394",
  appId: "1:859592733394:web:3cfc8ebd8e7a99b82fb30b"
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

console.log("[INIT] 🧭 About to create navigation components");

// Create stack navigator
const Stack = createNativeStackNavigator();
console.log("[INIT] ✅ Stack navigator created");

console.log("[INIT] 🏠 Test HomeScreen removed - using real app screens");
console.log("[INIT] 📦 RealAppNavigator will render AuthStack or AppStack based on user auth state");

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
      <Text style={styles.logTitle}>🔧 DEBUG LOGS</Text>
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

// Real App Navigator - determines which stack to show based on auth state
const RealAppNavigator = () => {
  console.log("[NAV] 🚀 RealAppNavigator component called");
  
  // Get user state from our AuthenticatedUserProvider
  const { user, isLoading } = React.useContext(AuthenticatedUserContext);
  console.log("[NAV] 👤 User from context:", user ? `${user.email || user.uid}` : 'null');
  console.log("[NAV] ⏳ Loading state:", isLoading);
  console.log("[NAV] 🔍 User logged in:", user !== null);
  
  // Show loading screen while determining auth state
  if (isLoading) {
    console.log("[NAV] ⏳ Auth still loading, showing loading screen");
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.statusDetails}>Checking authentication...</Text>
      </View>
    );
  }
  
  // Show appropriate stack based on authentication
  if (user) {
    console.log("[NAV] ✅ User authenticated, rendering AppStack");
    console.log("[NAV] 🏠 About to render main app screens");
    
    try {
      return <AppStack />;
    } catch (error) {
      console.error("[NAV] 🔥 Error rendering AppStack:", error);
      console.error("[NAV] 🔥 AppStack error stack:", error.stack);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>AppStack Error</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
      );
    }
  } else {
    console.log("[NAV] 🔐 User not authenticated, rendering AuthStack");
    console.log("[NAV] 👋 About to render auth/onboarding screens");
    
    try {
      return <AuthStack />;
    } catch (error) {
      console.error("[NAV] 🔥 Error rendering AuthStack:", error);
      console.error("[NAV] 🔥 AuthStack error stack:", error.stack);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>AuthStack Error</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
      );
    }
  }
};

console.log("[INIT] 🚀 RealAppNavigator component defined");

const App = () => {
  console.log("[INIT] 🔄 App component function called");
  console.log("[INIT] ✅ Navigation debug mode active");
  console.log("[INIT] 📱 Platform:", Platform.OS);
  console.log("[INIT] 🧭 About to test navigation components");
  
  // Add test logs
  console.warn("[TEST] ⚠️ Navigation test warning");
  console.error("[TEST] ❌ Navigation test error");
  
  console.log("[INIT] 🚀 About to render NavigationContainer with AuthenticatedUserProvider");
  console.log("[INIT] 🔐 Auth instance status for provider:", auth ? 'Available' : 'Not available');
  
  // Split screen: Navigation on top, logs on bottom
  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.appContainer}>
        {/* Navigation Section */}
        <View style={styles.navigationContainer}>
          <AuthenticatedUserProvider auth={auth}>
            <NavigationContainer>
              <RealAppNavigator />
            </NavigationContainer>
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
  // Real app screens will have their own styles
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
