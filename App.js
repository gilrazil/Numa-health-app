import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import * as Updates from 'expo-updates';

// Import Firebase configuration to ensure it's initialized
import "./config/firebase";
import { RootNavigator } from "./navigation/RootNavigator";
import { AuthenticatedUserProvider } from "./providers";
import { Colors } from "./config";

const App = () => {
  const [appError, setAppError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Startup error protection
    const initializeApp = async () => {
      try {
        // Clear any corrupted cache on startup
        if (__DEV__) {
          console.log('🚀 App initializing...');
        }
        
        // Add small delay to ensure native modules are ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsReady(true);
      } catch (error) {
        console.error('🔥 App initialization error:', error);
        setAppError(error);
      }
    };

    // Set up global error handler
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('🔥 Global error caught:', error);
      if (isFatal) {
        setAppError(error);
      } else {
        // Let React Native handle non-fatal errors
        originalHandler(error, isFatal);
      }
    });

    initializeApp();

    // Cleanup
    return () => {
      ErrorUtils.setGlobalHandler(originalHandler);
    };
  }, []);

  const handleRetry = async () => {
    setAppError(null);
    setIsReady(false);
    
    try {
      // Try to reload the app
      if (Platform.OS === 'ios' && !__DEV__) {
        await Updates.reloadAsync();
      } else {
        // Reinitialize for development
        setTimeout(() => setIsReady(true), 1000);
      }
    } catch (error) {
      console.error('🔥 Retry failed:', error);
      setAppError(error);
    }
  };

  // Show error screen if app failed to initialize
  if (appError) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>App Error</Text>
          <Text style={styles.errorMessage}>
            Something went wrong during startup. Please try again.
          </Text>
          {__DEV__ && (
            <Text style={styles.errorDetails}>
              {appError.toString()}
            </Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    );
  }

  // Show loading screen until app is ready
  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Render main app
  return (
    <AuthenticatedUserProvider>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </AuthenticatedUserProvider>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.red,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 12,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 8,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.mediumGray,
  },
});

export default App;
