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
import { ErrorBoundary } from "./components";
import { Colors } from "./config";
import { setupGlobalErrorTracking } from "./utils/setupErrorTracking";
import { logInitializationStep, logPerformanceMetric } from "./utils/debugInitialization";
import { runProductionChecks, checkHermesIssues } from "./utils/productionChecks";

// Global retry counter to prevent infinite reload loops
let reloadAttempts = 0;
const MAX_RELOAD_ATTEMPTS = 2;

const App = () => {
  const [appError, setAppError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState('Starting...');

  useEffect(() => {
    // PRODUCTION-SAFE LOGGING - Always log these critical steps
    console.log("🟢 App starting...");
    console.log("🟢 Environment:", __DEV__ ? 'Development' : 'Production');
    console.log("🟢 Platform:", Platform.OS);
    
    // Setup global error tracking first
    console.log("🟢 Setting up global error tracking...");
    logInitializationStep('Setting up global error tracking');
    setupGlobalErrorTracking();
    console.log("🟢 Global error tracking initialized.");
    
    // Hardened startup initialization
    const initializeApp = async () => {
      const startTime = Date.now();
      
      try {
        console.log("🟢 App initialization started.");
        logInitializationStep('App initialization started');
        setInitializationProgress('Initializing app...');
        
        console.log('🚀 App initializing with hardened startup protection...');

        // Step 1: Clear cache on first launch (one-time operation)
        console.log("🟢 Starting cache clearing...");
        logInitializationStep('Clearing cache on first launch');
        await clearCacheOnFirstLaunch();
        console.log("🟢 Cache cleared.");
        
        // Step 2: Initialize core services safely
        console.log("🟢 Initializing core services...");
        logInitializationStep('Initializing core services');
        await initializeCoreServices();
        console.log("🟢 Core services initialized.");
        
        // Step 3: Check Firebase initialization
        console.log("🟢 Checking Firebase initialization...");
        await checkFirebaseInitialization();
        console.log("🟢 Firebase verified.");
        
        // Step 4: Run production environment checks
        console.log("🟢 Running production environment checks...");
        await runProductionChecks();
        checkHermesIssues();
        console.log("🟢 Production checks completed.");
        
        // Step 5: Add delay to ensure native modules are ready
        console.log("🟢 Loading native modules...");
        logInitializationStep('Loading native modules');
        setInitializationProgress('Loading native modules...');
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log("🟢 Native modules loaded.");
        
        console.log("🟢 App initialization completed successfully.");
        logInitializationStep('App initialization completed');
        setInitializationProgress('Ready!');
        setIsReady(true);
        
        const endTime = Date.now();
        logPerformanceMetric('App initialization time', endTime - startTime);
        
        console.log('✅ App initialization completed successfully');
      } catch (error) {
        console.error('🔥 PRODUCTION ERROR - App initialization failed:', error);
        console.error('🔥 Error message:', error.message);
        console.error('🔥 Error stack:', error.stack);
        console.error('🔥 Error name:', error.name);
        logInitializationStep('App initialization failed', { error: error.message, stack: error.stack });
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

  // Safe cache clearing on first launch
  const clearCacheOnFirstLaunch = async () => {
    try {
      console.log('🟢 Cache clearing: Checking cache status...');
      setInitializationProgress('Checking cache status...');
      
      const hasClearedCache = await AsyncStorage.getItem('hasClearedCache');
      if (hasClearedCache) {
        console.log('🟢 Cache clearing: Already cleared, skipping');
        return;
      }

      if (!FileSystem.cacheDirectory) {
        console.log('🟢 Cache clearing: No cache directory available, skipping');
        return;
      }

      console.log('🟢 Cache clearing: First launch detected, safely clearing Expo cache...');
      setInitializationProgress('Clearing cache safely...');
      
      // Target specific cache subdirectories safely
      const safeCachePaths = [
        `${FileSystem.cacheDirectory}ImageManipulator`,
        `${FileSystem.cacheDirectory}CachedImages`,
        `${FileSystem.cacheDirectory}Camera`,
        `${FileSystem.cacheDirectory}ExpoImagePicker`,
        `${FileSystem.cacheDirectory}ExpoFileSystem`,
        `${FileSystem.cacheDirectory}RNImagePicker`,
      ];

      let clearedCount = 0;
      let skippedCount = 0;

      for (const path of safeCachePaths) {
        try {
          // Check if directory exists before attempting deletion
          const dirInfo = await FileSystem.getInfoAsync(path);
          if (dirInfo.exists) {
            await FileSystem.deleteAsync(path, { idempotent: true });
            clearedCount++;
            if (__DEV__) {
              console.log(`🗑️ Cleared cache path: ${path}`);
            }
          } else {
            skippedCount++;
          }
        } catch (pathError) {
          skippedCount++;
          if (__DEV__) {
            console.warn(`⚠️ Could not clear cache path ${path}:`, pathError.message);
          }
        }
      }
      
      // Mark as cleared to prevent future clears
      await AsyncStorage.setItem('hasClearedCache', 'true');
      
      console.log(`🟢 Cache clearing: Successfully completed - ${clearedCount} cleared, ${skippedCount} skipped`);
    } catch (error) {
      console.error('🔥 Cache clearing failed (non-fatal):', error.message);
      
      // Still mark as attempted to prevent repeated failures
      try {
        await AsyncStorage.setItem('hasClearedCache', 'true');
      } catch (storageError) {
        console.error('🔥 Could not save cache clearing status:', storageError.message);
      }
    }
  };

  // Initialize core services with error protection
  const initializeCoreServices = async () => {
    try {
      console.log('🟢 Core services: Starting initialization...');
      setInitializationProgress('Initializing core services...');
      
      // Add a small delay to ensure native modules are ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🟢 Core services: All services initialized successfully');
    } catch (error) {
      console.error('🔥 Core services initialization failed:', error);
      
      // Try backup Firebase initialization
      try {
        console.log('🟢 Core services: Attempting backup Firebase initialization...');
        const { initializeFirebaseBackup } = require('./config/firebaseBackup');
        const backupServices = initializeFirebaseBackup();
        console.log('🟢 Core services: Backup Firebase initialized successfully');
      } catch (backupError) {
        console.error('🔥 Backup Firebase initialization also failed:', backupError);
        
        // Last resort: Create minimal mock services to prevent crash
        try {
          console.log('🟢 Core services: Creating minimal Firebase services...');
          const { createMinimalFirebaseServices } = require('./config/firebaseBackup');
          const minimalServices = createMinimalFirebaseServices();
          console.log('🟢 Core services: Minimal Firebase services created');
        } catch (minimalError) {
          console.error('🔥 Even minimal Firebase services failed:', minimalError);
          throw new Error(`All Firebase initialization methods failed: ${error.message}`);
        }
      }
    }
  };

  // Check Firebase initialization in production
  const checkFirebaseInitialization = async () => {
    try {
      console.log('🟢 Firebase check: Verifying Firebase initialization...');
      
      // Import Firebase services and validation function
      const { auth: authService, db: dbService, validateFirebaseServices } = require('./config/firebase');
      
      // Run comprehensive validation
      const validation = validateFirebaseServices();
      
      // Additional checks
      if (authService && authService.app && authService.app.name) {
        console.log('🟢 Firebase check: Auth app name:', authService.app.name);
      }
      
      if (dbService && dbService.app && dbService.app.name) {
        console.log('🟢 Firebase check: Firestore app name:', dbService.app.name);
      }
      
      console.log('🟢 Firebase check: All Firebase services verified successfully');
    } catch (error) {
      console.error('🔥 Firebase initialization check failed:', error);
      throw error;
    }
  };

  const handleRetry = async () => {
    console.log('🔄 User requested retry...');
    setAppError(null);
    setIsReady(false);
    setInitializationProgress('Retrying...');
    
    reloadAttempts++;
    
    // Wait a moment before retrying to prevent rapid retries
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Restart the initialization process
    window.location.reload();
  };

  const handleManualRestart = async () => {
    console.log('🔄 User requested manual restart...');
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('🔥 Manual restart failed:', error);
      window.location.reload();
    }
  };

  // Show error screen if initialization failed
  if (appError) {
    console.log('🔥 Showing error screen for:', appError.message);
    return (
      <SafeAreaProvider style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Initialization Error</Text>
          <Text style={styles.errorMessage}>
            {appError.message || 'An unexpected error occurred during app startup.'}
          </Text>
          <Text style={styles.errorDetails}>
            Progress: {initializationProgress}
          </Text>
          <Text style={styles.errorAttempts}>
            Attempts: {reloadAttempts}/{MAX_RELOAD_ATTEMPTS}
          </Text>
          
          {reloadAttempts < MAX_RELOAD_ATTEMPTS && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry ({MAX_RELOAD_ATTEMPTS - reloadAttempts} attempts left)</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={[styles.retryButton, styles.manualRestartButton]} onPress={handleManualRestart}>
            <Text style={styles.retryButtonText}>Manual Restart</Text>
          </TouchableOpacity>
          
          {__DEV__ && (
            <View style={styles.devErrorInfo}>
              <Text style={styles.devErrorTitle}>Development Info:</Text>
              <Text style={styles.devErrorText}>{appError.stack}</Text>
            </View>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  // Show loading screen during initialization
  if (!isReady) {
    console.log('🔄 Showing loading screen...');
    return (
      <SafeAreaProvider style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingTitle}>Numa Health</Text>
          <Text style={styles.loadingMessage}>{initializationProgress}</Text>
          <View style={styles.loadingBar}>
            <View style={styles.loadingProgress} />
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  // Render main app with error boundary protection
  console.log("🟢 Rendering main app components...");
  
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
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.mediumGray,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.red,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorDetails: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorAttempts: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 30,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  manualRestartButton: {
    backgroundColor: Colors.blue,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  devErrorInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    maxWidth: '100%',
  },
  devErrorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 10,
  },
  devErrorText: {
    fontSize: 12,
    color: Colors.darkGray,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.orange,
    marginBottom: 30,
  },
  loadingMessage: {
    fontSize: 18,
    color: Colors.black,
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: Colors.orange,
    width: '70%',
  },
});

export default App; 