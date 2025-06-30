import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Platform } from "react-native";

// Import Firebase configuration to ensure it's initialized
import "./config/firebase";
import { RootNavigator } from "./navigation/RootNavigator";
import { AuthenticatedUserProvider } from "./providers";
import { ErrorBoundary } from "./components";

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [appError, setAppError] = useState(null);

  useEffect(() => {
    console.log("🟢 SIMPLIFIED APP: Starting...");
    console.log("🟢 Environment:", __DEV__ ? 'Development' : 'Production');
    console.log("🟢 Platform:", Platform.OS);
    
    // Simple initialization with minimal steps
    const initializeApp = async () => {
      try {
        console.log("🟢 SIMPLIFIED APP: Initializing...");
        
        // Just a simple delay to simulate initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("🟢 SIMPLIFIED APP: Ready!");
        setIsReady(true);
      } catch (error) {
        console.error('🔥 SIMPLIFIED APP: Error:', error);
        setAppError(error);
      }
    };

    initializeApp();
  }, []);

  // Show error screen if something went wrong
  if (appError) {
    console.log("🔥 SIMPLIFIED APP: Showing error:", appError.message);
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>App Error</Text>
          <Text style={styles.errorMessage}>{appError.message}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Show loading screen
  if (!isReady) {
    console.log("🟢 SIMPLIFIED APP: Showing loading screen");
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
          <Text style={styles.subText}>Simplified App Test</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Try to render the main app
  console.log("🟢 SIMPLIFIED APP: Rendering main app components...");
  
  try {
    return (
      <ErrorBoundary>
        <AuthenticatedUserProvider>
          <SafeAreaProvider>
            <ErrorBoundary>
              <RootNavigator />
            </ErrorBoundary>
          </SafeAreaProvider>
        </AuthenticatedUserProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('🔥 SIMPLIFIED APP: Render error:', error);
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Render Error</Text>
          <Text style={styles.errorMessage}>Failed to render app: {error.message}</Text>
        </View>
      </SafeAreaProvider>
    );
  }
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',  
    color: '#000000',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default App;
