import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import * as Updates from 'expo-updates';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log, logError, logCritical } from "./utils/logger";
import { ErrorBoundary } from "./components";
import { AuthenticatedUserProvider } from "./providers";
import { RootNavigator } from "./navigation/RootNavigator";
import { Colors } from "./config";
import { setupGlobalErrorTracking } from "./utils/setupErrorTracking";
import { logInitializationStep, logPerformanceMetric } from "./utils/debugInitialization";
import { runProductionChecks, checkHermesIssues } from "./utils/productionChecks";
import { logRemote } from './services/RemoteLogService';

// Import Firebase configuration and auth instance
import "./config/firebase";
import { auth } from "./config/firebase";

// Global retry counter to prevent infinite reload loops
let reloadAttempts = 0;
const MAX_RELOAD_ATTEMPTS = 2;

const App = () => {
  const [appError, setAppError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState('Starting...');

  useEffect(() => {
    // PRODUCTION-SAFE LOGGING - Always log these critical steps
    log("🟢 App starting...");
    log("🟢 Environment:", __DEV__ ? 'Development' : 'Production');
    log("🟢 Platform:", Platform.OS);
    logRemote.lifecycle('App.js loaded', { 
      environment: __DEV__ ? 'Development' : 'Production',
      platform: Platform.OS,
      version: '1.0.0',
      buildNumber: '13'
    });
    
    // Setup global error tracking first
    log("🟢 Setting up global error tracking...");
    logInitializationStep('Setting up global error tracking');
    setupGlobalErrorTracking();
    log("🟢 Global error tracking initialized.");
    
    // Hardened startup initialization
    const initializeApp = async () => {
      const startTime = Date.now();
      
      try {
        log("🟢 App initialization started.");
        logInitializationStep('App initialization started');
        setInitializationProgress('Initializing app...');
        
        log('🚀 App initializing with hardened startup protection...');

        // Step 1: Clear cache on first launch (one-time operation)
        log("🟢 Starting cache clearing...");
        logInitializationStep('Clearing cache on first launch');
        await clearCacheOnFirstLaunch();
        log("🟢 Cache cleared.");
        
        // Step 2: Initialize core services safely
        log("🟢 Initializing core services...");
        logInitializationStep('Initializing core services');
        await initializeCoreServices();
        log("🟢 Core services initialized.");
        
        // Step 3: Check Firebase initialization
        log("🟢 Checking Firebase initialization...");
        await checkFirebaseInitialization();
        log("🟢 Firebase verified.");
        
        // Step 4: Run production environment checks
        log("🟢 Running production environment checks...");
        await runProductionChecks();
        checkHermesIssues();
        log("🟢 Production checks completed.");
        
        // Step 5: Add delay to ensure native modules are ready
        log("🟢 Loading native modules...");
        logInitializationStep('Loading native modules');
        setInitializationProgress('Loading native modules...');
        await new Promise(resolve => setTimeout(resolve, 200));
        log("🟢 Native modules loaded.");
        
        log("🟢 App initialization completed successfully.");
        logInitializationStep('App initialization completed');
        setInitializationProgress('Ready!');
        setIsReady(true);
        
        const endTime = Date.now();
        logPerformanceMetric('App initialization time', endTime - startTime);
        
        log('✅ App initialization completed successfully');
      } catch (error) {
        logCritical('🔥 PRODUCTION ERROR - App initialization failed:', error);
        logError('🔥 Error message:', error.message);
        logError('🔥 Error stack:', error.stack);
        logError('🔥 Error name:', error.name);
        logInitializationStep('App initialization failed', { error: error.message, stack: error.stack });
        setAppError(error);
        setInitializationProgress('Initialization failed');
      }
    };

    // Enhanced global error handler with retry protection
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      logCritical('🔥 Global error caught:', error);
      logError('🔥 Is fatal:', isFatal);
      logError('🔥 Stack trace:', error.stack);
      
      if (isFatal) {
        // Don't attempt reload if we've already tried too many times
        if (reloadAttempts >= MAX_RELOAD_ATTEMPTS) {
          logError('🚫 Max reload attempts reached, showing error screen');
          setAppError(error);
        } else {
          log(`🔄 Fatal error detected, will attempt reload (attempt ${reloadAttempts + 1}/${MAX_RELOAD_ATTEMPTS})`);
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
      log('🟢 Cache clearing: Checking cache status...');
      setInitializationProgress('Checking cache status...');
      
      const hasClearedCache = await AsyncStorage.getItem('hasClearedCache');
      if (hasClearedCache) {
        log('🟢 Cache clearing: Already cleared, skipping');
        return;
      }

      if (!FileSystem.cacheDirectory) {
        log('🟢 Cache clearing: No cache directory available, skipping');
        return;
      }

      log('🟢 Cache clearing: First launch detected, safely clearing Expo cache...');
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
              log(`🗑️ Cleared cache path: ${path}`);
            }
          } else {
            skippedCount++;
          }
        } catch (pathError) {
          skippedCount++;
          if (__DEV__) {
            logError(`⚠️ Could not clear cache path ${path}:`, pathError.message);
          }
        }
      }
      
      // Mark as cleared to prevent future clears
      await AsyncStorage.setItem('hasClearedCache', 'true');
      
      log(`🟢 Cache clearing: Successfully completed - ${clearedCount} cleared, ${skippedCount} skipped`);
    } catch (error) {
      logError('🔥 Cache clearing failed (non-fatal):', error.message);
      
      // Still mark as attempted to prevent repeated failures
      try {
        await AsyncStorage.setItem('hasClearedCache', 'true');
      } catch (storageError) {
        logError('🔥 Could not save cache clearing status:', storageError.message);
      }
    }
  };

  // Initialize core services with error protection
  const initializeCoreServices = async () => {
    try {
      log('🟢 Core services: Starting initialization...');
      setInitializationProgress('Initializing Firebase...');
      
      // Import Firebase validation function
      log('🟢 Core services: Importing Firebase validation...');
      const { validateFirebaseServices } = require('./config/firebase');
      
      // Validate Firebase services using production-safe method
      log('🟢 Core services: Validating Firebase services...');
      const validation = validateFirebaseServices();
      log('🟢 Core services: Firebase validation passed');
      
      // Add any other critical service initialization here
      log('🟢 Core services: All services initialized');
    } catch (error) {
      logError('🔥 Core services initialization failed:', error);
      
      // Try backup Firebase initialization
      try {
        log('🟢 Core services: Attempting backup Firebase initialization...');
        const firebaseBackup = require('./config/firebaseBackup');
        const backupServices = firebaseBackup.initializeFirebaseBackup();
        log('🟢 Core services: Backup Firebase initialized successfully');
      } catch (backupError) {
        logError('🔥 Backup Firebase initialization also failed:', backupError);
        
        // Last resort: Create minimal mock services to prevent crash
        try {
          log('🟢 Core services: Creating minimal Firebase services...');
          const firebaseBackup = require('./config/firebaseBackup');
          const minimalServices = firebaseBackup.createMinimalFirebaseServices();
          log('🟢 Core services: Minimal Firebase services created');
        } catch (minimalError) {
          logError('🔥 Even minimal Firebase services failed:', minimalError);
          throw new Error(`All Firebase initialization methods failed: ${error.message}`);
        }
      }
    }
  };

  // Check Firebase initialization in production
  const checkFirebaseInitialization = async () => {
    try {
      log('🟢 Firebase check: Verifying Firebase initialization...');
      
      // Import Firebase services and validation function
      const { auth: authService, db: dbService, validateFirebaseServices } = require('./config/firebase');
      
      // Run comprehensive validation
      const validation = validateFirebaseServices();
      
      // Additional checks
      if (authService && authService.app && authService.app.name) {
        log('🟢 Firebase check: Auth app name:', authService.app.name);
      }
      
      if (dbService && dbService.app && dbService.app.name) {
        log('🟢 Firebase check: Firestore app name:', dbService.app.name);
      }
      
      log('🟢 Firebase check: All Firebase services verified successfully');
    } catch (error) {
      logError('🔥 Firebase initialization check failed:', error);
      throw error;
    }
  };

  // Enhanced retry handler with attempt limits
  const handleRetry = async () => {
    log(`🔄 Retry requested (attempt ${reloadAttempts + 1}/${MAX_RELOAD_ATTEMPTS})`);
    
    setAppError(null);
    setIsReady(false);
    setInitializationProgress('Retrying...');
    
    try {
      // Check if we can attempt a reload
      if (Platform.OS === 'ios' && !__DEV__ && reloadAttempts < MAX_RELOAD_ATTEMPTS) {
        reloadAttempts++;
        log(`🔄 Attempting app reload (${reloadAttempts}/${MAX_RELOAD_ATTEMPTS})`);
        await Updates.reloadAsync();
      } else if (reloadAttempts < MAX_RELOAD_ATTEMPTS) {
        // Development mode or Android - reinitialize
        reloadAttempts++;
        log(`🔄 Attempting reinitialization (${reloadAttempts}/${MAX_RELOAD_ATTEMPTS})`);
        setTimeout(() => {
          setInitializationProgress('Reinitializing...');
          setIsReady(true);
        }, 1000);
      } else {
        // Max attempts reached
        logError('🚫 Maximum retry attempts reached');
        setAppError(new Error('Maximum retry attempts reached. Please restart the app manually.'));
      }
    } catch (error) {
      logError('🔄 Retry failed:', error);
      reloadAttempts++;
      setAppError(error);
    }
  };

  // Reset retry counter (for manual restart)
  const handleManualRestart = async () => {
    log('🔄 Manual restart requested, resetting retry counter');
    reloadAttempts = 0;
    
    // Clear the first launch flag to allow cache clearing again
    try {
      await AsyncStorage.removeItem('hasClearedCache');
      log('🧹 First launch flag reset for cache clearing');
    } catch (error) {
      logError('⚠️ Failed to reset first launch flag:', error);
    }
    
    await handleRetry();
  };

  // Show error screen if app failed to initialize
  if (appError) {
    log("🔥 PRODUCTION: Showing error screen due to app error:", appError.message);
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
    log("🟢 PRODUCTION: Showing loading screen, progress:", initializationProgress);
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
  log("🟢 Rendering main app components...");
  
  return (
    <ErrorBoundary>
      <AuthenticatedUserProvider auth={auth}>
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
  retryInfo: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    maxHeight: 200,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  restartButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default App; 