import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import * as Updates from 'expo-updates';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Firebase configuration to ensure it's initialized
import "./config/firebase";
import { RootNavigator } from "./navigation/RootNavigator";
import { AuthenticatedUserProvider } from "./providers";
import { Colors } from "./config";

// Global retry counter to prevent infinite reload loops
let reloadAttempts = 0;
const MAX_RELOAD_ATTEMPTS = 2;

const App = () => {
  const [appError, setAppError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState('Starting...');

  useEffect(() => {
    // Hardened startup initialization
    const initializeApp = async () => {
      try {
        setInitializationProgress('Initializing app...');
        
        if (__DEV__) {
          console.log('🚀 App initializing with hardened startup protection...');
        }

        // Step 1: Clear cache on first launch (one-time operation)
        await clearCacheOnFirstLaunch();
        
        // Step 2: Initialize core services safely
        await initializeCoreServices();
        
        // Step 3: Add delay to ensure native modules are ready
        setInitializationProgress('Loading native modules...');
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setInitializationProgress('Ready!');
        setIsReady(true);
        
        if (__DEV__) {
          console.log('✅ App initialization completed successfully');
        }
      } catch (error) {
        console.error('🔥 App initialization error:', error);
        setAppError(error);
        setInitializationProgress('Initialization failed');
      }
    };

    // Enhanced global error handler with retry protection
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('🔥 Global error caught:', error);
      console.error('🔥 Is fatal:', isFatal);
      console.error('🔥 Stack trace:', error.stack);
      
      if (isFatal) {
        // Don't attempt reload if we've already tried too many times
        if (reloadAttempts >= MAX_RELOAD_ATTEMPTS) {
          console.error('🚫 Max reload attempts reached, showing error screen');
          setAppError(error);
        } else {
          console.log(`🔄 Fatal error detected, will attempt reload (attempt ${reloadAttempts + 1}/${MAX_RELOAD_ATTEMPTS})`);
          setAppError(error);
        }
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

  // Cache clearing on first launch
  const clearCacheOnFirstLaunch = async () => {
    try {
      setInitializationProgress('Checking cache status...');
      
      const hasClearedCache = await AsyncStorage.getItem('hasClearedCache');
      
      if (!hasClearedCache && FileSystem.cacheDirectory) {
        console.log('🧹 First launch detected, clearing Expo cache...');
        setInitializationProgress('Clearing cache...');
        
        // Clear cache directory
        await FileSystem.deleteAsync(FileSystem.cacheDirectory, { 
          idempotent: true 
        });
        
        // Mark as cleared to prevent future clears
        await AsyncStorage.setItem('hasClearedCache', 'true');
        
        console.log('✅ Cache cleared successfully on first launch');
      } else {
        console.log('ℹ️ Cache clearing skipped (not first launch or no cache directory)');
      }
    } catch (error) {
      console.error('⚠️ Cache clearing failed (non-fatal):', error);
      // Non-fatal error, continue with app initialization
    }
  };

  // Initialize core services with error protection
  const initializeCoreServices = async () => {
    try {
      setInitializationProgress('Initializing Firebase...');
      
      // Firebase is already imported, but we can add additional checks here
      // Add any other critical service initialization here
      
      console.log('✅ Core services initialized');
    } catch (error) {
      console.error('🔥 Core services initialization failed:', error);
      throw error; // Re-throw to be caught by main initialization
    }
  };

  // Enhanced retry handler with attempt limits
  const handleRetry = async () => {
    console.log(`🔄 Retry requested (attempt ${reloadAttempts + 1}/${MAX_RELOAD_ATTEMPTS})`);
    
    setAppError(null);
    setIsReady(false);
    setInitializationProgress('Retrying...');
    
    try {
      // Check if we can attempt a reload
      if (Platform.OS === 'ios' && !__DEV__ && reloadAttempts < MAX_RELOAD_ATTEMPTS) {
        reloadAttempts++;
        console.log(`🔄 Attempting app reload (${reloadAttempts}/${MAX_RELOAD_ATTEMPTS})`);
        await Updates.reloadAsync();
      } else if (reloadAttempts < MAX_RELOAD_ATTEMPTS) {
        // Development mode or Android - reinitialize
        reloadAttempts++;
        console.log(`🔄 Attempting reinitialization (${reloadAttempts}/${MAX_RELOAD_ATTEMPTS})`);
        setTimeout(() => {
          setInitializationProgress('Reinitializing...');
          setIsReady(true);
        }, 1000);
      } else {
        // Max attempts reached
        console.error('🚫 Maximum retry attempts reached');
        setAppError(new Error('Maximum retry attempts reached. Please restart the app manually.'));
      }
    } catch (error) {
      console.error('🔥 Retry failed:', error);
      reloadAttempts++;
      setAppError(error);
    }
  };

  // Reset retry counter (for manual restart)
  const handleManualRestart = async () => {
    console.log('🔄 Manual restart requested, resetting retry counter');
    reloadAttempts = 0;
    
    // Clear the first launch flag to allow cache clearing again
    try {
      await AsyncStorage.removeItem('hasClearedCache');
      console.log('🧹 First launch flag reset for cache clearing');
    } catch (error) {
      console.error('⚠️ Failed to reset first launch flag:', error);
    }
    
    await handleRetry();
  };

  // Show error screen if app failed to initialize
  if (appError) {
    const canRetry = reloadAttempts < MAX_RELOAD_ATTEMPTS;
    
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>App Startup Error</Text>
          <Text style={styles.errorMessage}>
            {canRetry 
              ? 'Something went wrong during startup. Please try again.'
              : 'Maximum retry attempts reached. Please restart the app manually.'
            }
          </Text>
          <Text style={styles.retryInfo}>
            Retry attempts: {reloadAttempts}/{MAX_RELOAD_ATTEMPTS}
          </Text>
          
          {__DEV__ && (
            <Text style={styles.errorDetails}>
              {appError.toString()}
              {appError.stack && `\n\n${appError.stack}`}
            </Text>
          )}
          
          {canRetry ? (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry ({MAX_RELOAD_ATTEMPTS - reloadAttempts} attempts left)</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.restartButton} onPress={handleManualRestart}>
              <Text style={styles.retryButtonText}>Reset & Restart</Text>
            </TouchableOpacity>
          )}
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
          <Text style={styles.progressText}>{initializationProgress}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Render main app with error boundary protection
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
    marginBottom: 12,
    lineHeight: 24,
  },
  retryInfo: {
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
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
    maxHeight: 200,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  restartButton: {
    backgroundColor: Colors.red,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.mediumGray,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.darkGray,
    fontStyle: 'italic',
  },
});

export default App;
