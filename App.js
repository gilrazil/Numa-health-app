import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Platform, LogBox, ScrollView, Button, TextInput, Alert, TouchableOpacity } from "react-native";
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
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
 * BUILD 25 STRATEGY: Authentication Testing
 * 
 * This build implements Build 25 from the systematic debugging approach:
 * ✅ Keep the working AuthenticatedUserProvider + Navigation from Build 24 (proven working)
 * ➕ Add simple login screen with email/password authentication
 * - Test Firebase auth.signInWithEmailAndPassword()
 * - Display user email on successful login (no automatic HomeScreen transition)
 * - Comprehensive logging for all auth operations
 * - Avoid complex hooks/components to reduce crash risk
 * - Incremental testing: Add authentication layer on top of working navigation
 */

// Add comprehensive logging for startup diagnostics
console.log("[INIT] 🚀 App.js mounted - Starting Build 25 diagnostic logging");
console.log("[INIT] 📱 Platform:", Platform.OS);
console.log("[INIT] 🔧 Environment:", __DEV__ ? 'Development' : 'Production');
console.log("[INIT] ⏰ Timestamp:", new Date().toISOString());
console.log("[INIT] 🎯 Build 25 Debug Mode: ENABLED");

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

console.log("[INIT] 🧪 Build 25 - Authentication Testing Strategy");
console.log("[INIT] 🎯 Testing Firebase authentication with simple login screen");
console.log("[INIT] 🔐 Focus: signInWithEmailAndPassword() + user email display");

const Stack = createStackNavigator();

// Build 25 Test Screens
const LoginTestScreen = ({ navigation }) => {
  const { user, isLoading } = React.useContext(AuthenticatedUserContext);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [authError, setAuthError] = React.useState(null);
  
  console.log("[LOGIN TEST] 🧪 LoginTestScreen component rendered");
  console.log("[LOGIN TEST] 👤 User from context:", user ? `Email: ${user.email}` : "NONE");
  console.log("[LOGIN TEST] ⏳ Loading state:", isLoading);
  
  const handleLogin = async () => {
    console.log("[LOGIN TEST] 🔑 Login attempt started");
    console.log("[LOGIN TEST] 📧 Email:", email);
    console.log("[LOGIN TEST] 🔒 Password length:", password.length);
    
    if (!email || !password) {
      console.log("[LOGIN TEST] ❌ Missing credentials");
      setAuthError("Please enter both email and password");
      return;
    }
    
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      console.log("[LOGIN TEST] 🔥 Calling Firebase signInWithEmailAndPassword");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("[LOGIN TEST] ✅ Firebase auth successful");
      console.log("[LOGIN TEST] 👤 User UID:", userCredential.user.uid);
      console.log("[LOGIN TEST] 📧 User email:", userCredential.user.email);
      console.log("[LOGIN TEST] 🎉 Authentication completed successfully");
      
      // Clear form on success
      setEmail('');
      setPassword('');
      
    } catch (error) {
      console.error("[LOGIN TEST] ❌ Firebase auth failed:", error.message);
      console.error("[LOGIN TEST] 🔧 Error code:", error.code);
      setAuthError(`Login failed: ${error.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LOGIN TEST - BUILD 25</Text>
      <Text style={styles.subtitle}>Testing Firebase Authentication</Text>
      
      {/* Auth Context Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Auth Context Loading: {isLoading ? "YES" : "NO"}</Text>
        <Text style={styles.statusText}>
          Current User: {user ? `✅ ${user.email}` : "❌ NONE"}
        </Text>
      </View>
      
      {/* Login Form - Only show if no user */}
      {!user && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Firebase Login Test</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          
          {authError && (
            <Text style={styles.errorText}>{authError}</Text>
          )}
          
          <TouchableOpacity
            style={[styles.loginButton, isAuthenticating && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isAuthenticating}
          >
            <Text style={styles.loginButtonText}>
              {isAuthenticating ? "Logging in..." : "Test Login"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Success State - Show user info */}
      {user && (
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>🎉 LOGIN SUCCESSFUL!</Text>
          <Text style={styles.successText}>Email: {user.email}</Text>
          <Text style={styles.successText}>UID: {user.uid}</Text>
          <Text style={styles.successSubtext}>
            Firebase authentication is working! ✅
          </Text>
        </View>
      )}
      
      <Text style={styles.strategy}>
        Build 25: Authentication Testing Strategy
      </Text>
      
      <Button
        title="Go to Navigation Test"
        onPress={() => navigation.navigate("NavigationTestScreen")}
        color="#2E7D32"
      />
    </View>
  );
};

const NavigationTestScreen = ({ navigation }) => {
  const { user, isLoading } = React.useContext(AuthenticatedUserContext);
  
  console.log("[NAV TEST] ⚡ NavigationTestScreen component rendered");
  console.log("[NAV TEST] 🧪 Navigation + Auth integration test");
  console.log("[NAV TEST] 👤 User from context:", user ? `Email: ${user.email}` : "NONE");
  console.log("[NAV TEST] ⏳ Loading state:", isLoading);
  
  return (
    <View style={[styles.container, { backgroundColor: "#E3F2FD" }]}>
      <Text style={[styles.title, { color: "#1976D2" }]}>NAVIGATION TEST - BUILD 25</Text>
      <Text style={[styles.subtitle, { color: "#1976D2" }]}>Navigation + Auth Context Working!</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: "#1976D2" }]}>
          User: {user ? `✅ ${user.email}` : "❌ NONE"}
        </Text>
        <Text style={[styles.statusText, { color: "#1976D2" }]}>
          Loading: {isLoading ? "YES" : "NO"}
        </Text>
      </View>
      
      <Text style={[styles.message, { color: "#1976D2" }]}>
        This screen also has auth context access, proving the provider works across navigation!
      </Text>
      
      <Button
        title="Back to Login Test"
        onPress={() => navigation.navigate("LoginTestScreen")}
        color="#1976D2"
      />
    </View>
  );
};

// Build 25 Test Navigator
const Build25TestNavigator = () => {
  console.log("[TEST NAV] 🧪 Build25TestNavigator component called");
  console.log("[TEST NAV] 🎯 Testing authentication + navigation with login screen");
  
  return (
    <Stack.Navigator 
      initialRouteName="LoginTestScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2E7D32",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen 
        name="LoginTestScreen" 
        component={LoginTestScreen}
        options={{ title: "Build 25 - Login Test" }}
      />
      <Stack.Screen 
        name="NavigationTestScreen" 
        component={NavigationTestScreen}
        options={{ title: "Build 25 - Navigation Test" }}
      />
    </Stack.Navigator>
  );
};

console.log("[INIT] 🧪 Build25TestNavigator component defined");

const App = () => {
  console.log("[INIT] 🔄 App component function called");
  console.log("[INIT] ✅ Build 25 debug mode active");
  console.log("[INIT] 📱 Platform:", Platform.OS);
  console.log("[INIT] 🧭 About to test authentication + navigation components");
  
  // Add test logs
  console.warn("[TEST] ⚠️ Build 25 test warning");
  console.error("[TEST] ❌ Build 25 test error");
  
  console.log("[INIT] 🚀 About to render AuthenticatedUserProvider + NavigationContainer + Auth test");
  console.log("[INIT] 🔐 Auth instance status for provider:", auth ? "Available" : "Not available");
  
  // NavigationContainer at root level with split screen inside
  return (
    <SafeAreaProvider>
      <AuthenticatedUserProvider auth={auth}>
        <NavigationContainer>
          <View style={styles.appContainer}>
            {/* Navigation Section */}
            <View style={styles.navigationContainer}>
              <Build25TestNavigator />
            </View>
            
            {/* Debug Logs Section */}
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>🔧 BUILD 25 DEBUG LOGS</Text>
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
  statusContainer: {
    backgroundColor: "#E8F5E8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    minWidth: 280,
  },
  statusText: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 5,
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  loginButton: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  successContainer: {
    backgroundColor: "#E8F5E8",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    minWidth: 280,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 5,
  },
  successSubtext: {
    fontSize: 14,
    color: "#4CAF50",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
});

export default App; 