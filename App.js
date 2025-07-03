import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Platform, LogBox, ScrollView, Button } from "react-native";
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { AuthenticatedUserProvider, AuthenticatedUserContext } from "./providers";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './config';

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
 * BUILD 24 STRATEGY: Option 2 - Basic Navigation + AuthenticatedUserProvider
 * 
 * This build implements Option 2 from the systematic debugging approach:
 * ✅ Keep the working AuthenticatedUserProvider from Build 23 (proven working)
 * ➕ Add basic navigation structure (NavigationContainer + Stack.Navigator)
 * - Test compatibility of navigation + provider
 * - Two simple test screens: AuthTestScreen and DummyScreen
 * - No real routing logic yet
 * - Incremental testing: Add navigation layer on top of working auth
 */

// Add comprehensive logging for startup diagnostics
console.log("[INIT] 🚀 App.js mounted - Starting Build 24 diagnostic logging");
console.log("[INIT] 📱 Platform:", Platform.OS);
console.log("[INIT] 🔧 Environment:", __DEV__ ? 'Development' : 'Production');
console.log("[INIT] ⏰ Timestamp:", new Date().toISOString());
console.log("[INIT] 🎯 Build 24 Debug Mode: ENABLED");

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

// Test Firebase basic initialization
console.log("[FIREBASE] 🔥 Initializing Firebase App...");
let firebaseApp = null;
let auth = null;
try {
  firebaseApp = initializeApp(firebaseConfig);
  console.log("[FIREBASE] ✅ Firebase App initialized successfully");
  console.log("[FIREBASE] 📱 App name:", firebaseApp.name);
  console.log("[FIREBASE] ⚙️ App options exist:", !!firebaseApp.options);
  
  // Initialize Firebase Auth
  console.log("[FIREBASE] 🔐 Initializing Firebase Auth...");
  try {
    auth = getAuth(firebaseApp);
    console.log("[FIREBASE] ✅ Firebase Auth initialized successfully");
    console.log("[FIREBASE] 🔗 Auth app reference:", !!auth.app);
  } catch (authError) {
    console.log("[FIREBASE] ⚠️ Auth app reference: true");
    console.log("[FIREBASE] 🔧 Auth app reference: true");
    auth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log("[FIREBASE] ✅ Firebase Auth initialized with persistence");
  }
} catch (err) {
  console.error("[FIREBASE] ❌ Firebase init failed:", err.message);
  console.error("[FIREBASE] 🔥 Firebase error details:", err);
}

console.log("[INIT] 🧪 Build 24 - Option 2: Basic Navigation + AuthenticatedUserProvider Test Strategy");
console.log("[INIT] 🎯 Testing ONLY navigation + AuthenticatedUserProvider compatibility");
console.log("[INIT] 🔧 Removed all unnecessary imports and dependencies for clean navigation test");

const Stack = createStackNavigator();

// Build 24 Test Screens
const AuthTestScreen = ({ navigation }) => {
  const { user, isLoading } = React.useContext(AuthenticatedUserContext);
  
  console.log("[AUTH TEST] 🧪 AuthTestScreen component rendered");
  console.log("[AUTH TEST] 👤 User from context:", user ? "Found" : "NONE");
  console.log("[AUTH TEST] ⏳ Loading state:", isLoading);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AUTH TEST - BUILD 24</Text>
      <Text style={styles.subtitle}>Loading: {isLoading ? "YES" : "NO"}</Text>
      <Text style={styles.subtitle}>User: {user ? "Found" : "NONE"}</Text>
      <Text style={styles.message}>
        If you see this green screen with auth info, the provider + navigation works!
      </Text>
      <Text style={styles.strategy}>
        Build 24: Option 2 - Basic Navigation + AuthenticatedUserProvider Test Strategy
      </Text>
      <Button
        title="Go to Dummy Screen"
        onPress={() => navigation.navigate("DummyScreen")}
        color="#2E7D32"
      />
    </View>
  );
};

const DummyScreen = ({ navigation }) => {
  const { user, isLoading } = React.useContext(AuthenticatedUserContext);
  
  console.log("[DUMMY] ⚡ DummyScreen component rendered");
  console.log("[DUMMY] 🧪 Navigation test screen loaded");
  console.log("[DUMMY] 👤 User from context:", user ? 'Found' : 'NONE');
  console.log("[DUMMY] ⏳ Loading state:", isLoading);
  
  return (
    <View style={[styles.container, { backgroundColor: "#E3F2FD" }]}>
      <Text style={[styles.title, { color: "#1976D2" }]}>DUMMY SCREEN - BUILD 24</Text>
      <Text style={[styles.subtitle, { color: "#1976D2" }]}>Navigation Working!</Text>
      <Text style={[styles.subtitle, { color: "#1976D2" }]}>User: {user ? 'Found' : 'NONE'}</Text>
      <Text style={[styles.subtitle, { color: "#1976D2" }]}>Loading: {isLoading ? 'YES' : 'NO'}</Text>
      <Text style={[styles.message, { color: "#1976D2" }]}>
        This screen also has auth context access, proving the provider works across navigation!
      </Text>
      <Button
        title="Back to Auth Test"
        onPress={() => navigation.navigate("AuthTestScreen")}
        color="#1976D2"
      />
    </View>
  );
};

// Build 24 Test Navigator - Modified to work with debug layout
const Build24TestNavigator = () => {
  console.log("[TEST NAV] 🧪 Build24TestNavigator component called");
  console.log("[TEST NAV] 🎯 Testing navigation + auth provider with simple screens");
  
  return (
    <Stack.Navigator 
      initialRouteName="AuthTestScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#4CAF50",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen 
        name="AuthTestScreen" 
        component={AuthTestScreen}
        options={{ title: "Build 24 - Auth Test" }}
      />
      <Stack.Screen 
        name="DummyScreen" 
        component={DummyScreen}
        options={{ title: "Build 24 - Dummy Screen" }}
      />
    </Stack.Navigator>
  );
};

console.log("[INIT] 🧪 Build24TestNavigator component defined");

const App = () => {
  console.log("[INIT] 🔄 App component function called");
  console.log("[INIT] ✅ Build 24 debug mode active");
  console.log("[INIT] 📱 Platform:", Platform.OS);
  console.log("[INIT] 🧭 About to test navigation components with authenticated user provider");
  
  // Add test logs
  console.warn("[TEST] ⚠️ Build 24 test warning");
  console.error("[TEST] ❌ Build 24 test error");
  
  console.log("[INIT] 🚀 About to render AuthenticatedUserProvider + NavigationContainer test");
  console.log("[INIT] 🔐 Auth instance status for provider:", auth ? "Available" : "Not available");
  
  // NavigationContainer at root level with split screen inside
  return (
    <SafeAreaProvider>
      <AuthenticatedUserProvider auth={auth}>
        <NavigationContainer>
          <View style={styles.appContainer}>
            {/* Navigation Section */}
            <View style={styles.navigationContainer}>
              <Build24TestNavigator />
            </View>
            
            {/* Debug Logs Section */}
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>🔧 BUILD 24 DEBUG LOGS</Text>
              <ScrollView style={styles.debugScroll}>
                {DEBUG_LOGS.map((log, index) => (
                  <Text key={index} style={[
                    styles.debugText,
                    log.includes("ERROR") ? styles.logError : 
                    log.includes("WARN") ? styles.logWarn : styles.logInfo
                  ]}>
                    {log}
                  </Text>
                ))}
              </ScrollView>
            </View>
          </View>
        </NavigationContainer>
      </AuthenticatedUserProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C8E6C9",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  appContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  navigationContainer: {
    flex: 2, // Takes up 2/3 of the screen
    backgroundColor: "#ffffff",
  },
  debugSection: {
    flex: 1, // Takes up 1/3 of the screen
    backgroundColor: "#000000",
    borderTopWidth: 2,
    borderTopColor: "#00ff00",
  },
  // Loading/Error styles for RealAppNavigator
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "bold",  
    color: "#2196F3",
    marginBottom: 8,
  },
  statusDetails: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF4444",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
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
    fontWeight: "bold",
    color: "#00ff00",
    marginBottom: 5,
    textAlign: "center",
  },
  logScrollView: {
    flex: 1,
  },
  logText: {
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 1,
    lineHeight: 12,
  },
  logInfo: {
    color: "#00ff00",
  },
  logWarn: {
    color: "#ffaa00",
  },
  logError: {
    color: "#ff4444",
  },
  debugContainer: {
    flex: 1,
  },
  debugPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: "#000",
    borderTopWidth: 2,
    borderTopColor: "#4CAF50",
  },
  debugTitle: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
    textAlign: "center",
  },
  debugScroll: {
    flex: 1,
    paddingHorizontal: 10,
  },
  debugText: {
    color: "#4CAF50",
    fontSize: 10,
    fontFamily: "monospace",
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: "#388E3C",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  strategy: {
    fontSize: 14,
    color: "#66BB6A",
    textAlign: "center",
    marginBottom: 30,
    fontStyle: "italic",
  },
});

export default App; 