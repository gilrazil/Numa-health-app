import React, { useState, useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { log, logError, logWarn } from '../utils/logger';

log("[NAV] 🏗️ RootNavigator module loaded");

import { AuthStack } from "./AuthStack";
import { AppStack } from "./AppStack";
import { AuthenticatedUserContext } from "../providers";
import { LoadingIndicator, ErrorBoundary, NavigationErrorFallback } from "../components";
import { auth, db } from "../config";
import { Colors } from "../config";
import { logNavigationError } from "../utils/setupErrorTracking";

log("[NAV] 📦 All RootNavigator imports loaded successfully");

export const RootNavigator = () => {
  log("[NAV] 🚀 RootNavigator component called");
  
  const { user, setUser } = useContext(AuthenticatedUserContext);
  log("[NAV] 👤 Auth context received - user:", user ? `${user.email || user.uid}` : 'null');
  
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [initializationError, setInitializationError] = useState(null);

  log("[NAV] 🎯 RootNavigator state initialized");
  log("[NAV] 📊 Initial state:", { isLoading: true, userProfile: null, authError: null, initializationError: null });

  useEffect(() => {
    log("[NAV] ⚡ RootNavigator useEffect triggered");
    
    let isMounted = true; // Track if component is still mounted
    let unsubscribeAuthStateChanged = null;
    
    // Hardened initialization with comprehensive error handling
    const initializeNavigation = async () => {
      try {
        log("[NAV] 🔥 RootNavigator: Starting hardened initialization...");
        log("[NAV] 🔍 Checking Firebase services availability...");
        
        // Ensure Firebase services are available before proceeding
        if (!auth || !db) {
          logError("[NAV] ❌ Firebase services not initialized - auth:", !!auth, "db:", !!db);
          throw new Error('Firebase services not initialized');
        }
        
        log("[NAV] ✅ Firebase services confirmed available");
        log("[NAV] 🔐 Setting up auth state listener...");

        // Setup auth state listener with enhanced error protection
        unsubscribeAuthStateChanged = onAuthStateChanged(auth,
          async (authenticatedUser) => {
            try {
              log("[NAV] 🔔 Auth state change triggered");
              log("[NAV] 👤 Authenticated user:", authenticatedUser ? `${authenticatedUser.email || authenticatedUser.uid}` : 'null');
              
              if (!isMounted) {
                log("[NAV] ⚠️ Component unmounted, skipping auth state update");
                return; // Prevent state updates on unmounted component
              }
              
              log("[NAV] 🔐 Auth state changed:", authenticatedUser ? 'User logged in' : 'User logged out');
              
              // Safely set user with validation
              if (authenticatedUser && typeof authenticatedUser === 'object') {
                log("[NAV] ✅ Valid user object received, updating context");
                setUser(authenticatedUser);
                setAuthError(null); // Clear any previous errors
                log("[NAV] 🔍 About to check user profile");
                
                // Check user profile with additional safety
                await checkUserProfileSafely(authenticatedUser);
              } else {
                // User logged out or invalid user object
                log("[NAV] 🚪 User logged out or invalid user object");
                if (isMounted) {
                  log("[NAV] 🧹 Clearing user state");
                  setUser(null);
                  setUserProfile(null);
                  setIsLoading(false);
                  setAuthError(null);
                  log("[NAV] ✅ User state cleared, isLoading set to false");
                }
              }
            } catch (error) {
              logError('[NAV] 🔥 Auth state change error:', error);
              logError('[NAV] 🔥 Auth error stack:', error.stack);
              if (isMounted) {
                setAuthError(`Authentication error: ${error.message}`);
                setIsLoading(false);
                log("[NAV] ❌ Auth error set, isLoading set to false");
              }
            }
          },
          (error) => {
            // Handle auth errors with enhanced logging
            logError('[NAV] 🔥 Firebase auth error:', error);
            logError('[NAV] 🔥 Error code:', error.code);
            logError('[NAV] 🔥 Error message:', error.message);
            logError('[NAV] 🔥 Error stack:', error.stack);
            
            if (isMounted) {
              setAuthError(`Firebase authentication failed: ${error.message}`);
              setIsLoading(false);
              log("[NAV] ❌ Firebase auth error set, isLoading set to false");
            }
          }
        );

        log("[NAV] ✅ RootNavigator: Auth listener initialized successfully");
        
      } catch (error) {
        logError('[NAV] 🔥 RootNavigator initialization error:', error);
        logError('[NAV] 🔥 Initialization error stack:', error.stack);
        logNavigationError('RootNavigator', error);
        if (isMounted) {
          setInitializationError(error);
          setIsLoading(false);
          log("[NAV] ❌ Initialization error set, isLoading set to false");
        }
      }
    };

    // Start initialization
    log("[NAV] 🚀 Starting navigation initialization");
    initializeNavigation();

    // Cleanup function with enhanced safety
    return () => {
      log("[NAV] 🧹 RootNavigator: Cleaning up...");
      
      isMounted = false;
      
      try {
        if (unsubscribeAuthStateChanged) {
          log("[NAV] 🔓 Unsubscribing from auth state changes");
          unsubscribeAuthStateChanged();
        }
      } catch (error) {
        logError('[NAV] ⚠️ Error during cleanup:', error);
      }
      
      log("[NAV] ✅ Cleanup completed");
    };
  }, []);

  // Enhanced user profile checking with comprehensive error handling
  const checkUserProfileSafely = async (user) => {
    log("[NAV] 🔍 checkUserProfileSafely called for user:", user?.uid);
    
    if (!user || !user.uid) {
      log("[NAV] ⚠️ Invalid user object provided to profile check");
      return;
    }
    
    try {
      log("[NAV] 🔍 Checking user profile for:", user.uid);

      // Ensure Firestore is available
      if (!db) {
        logError("[NAV] ❌ Firestore database not initialized");
        throw new Error('Firestore database not initialized');
      }
      
      log("[NAV] 🔥 Firestore available, creating user doc reference");
      const userDocRef = doc(db, 'users', user.uid);
      log("[NAV] 📄 Getting user document");
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        log("[NAV] ✅ User document exists, extracting data");
        const userData = userDoc.data();
        
        // Enhanced validation of user data
        if (userData && typeof userData === 'object' && !Array.isArray(userData)) {
          log("[NAV] ✅ Valid user data received");
          setUserProfile(userData);
          
          log("[NAV] 🔍 Profile check result:", { 
            profileCompleted: userData.profileCompleted,
            hasEssentialFields: !!(userData.gender && userData.age && userData.height && userData.weight && userData.goal),
            userEmail: user.email || 'No email'
          });
        } else {
          log("[NAV] ⚠️ Invalid user data received from Firestore");
          setUserProfile(null);
        }
      } else {
        log("[NAV] 👤 New user - no profile document exists");
        setUserProfile(null);
      }
    } catch (error) {
      logError('[NAV] 🔥 Error checking user profile:', error);
      logError('[NAV] 🔥 Profile check error details:', {
        code: error.code,
        message: error.message,
        uid: user?.uid,
        stack: error.stack
      });
      
      // Set profile to null on error to trigger onboarding
      setUserProfile(null);
    } finally {
      // Always set loading to false
      if (user) { // Only if we have a user
        log("[NAV] ✅ Profile check completed, setting isLoading to false");
        setIsLoading(false);
      }
    }
  };

  // Enhanced onboarding decision logic with safety checks
  const shouldShowOnboarding = () => {
    try {
      log("[NAV] 🤔 Determining if should show onboarding...");
      log("[NAV] 📊 State for onboarding decision:", { hasUser: !!user, hasUserProfile: !!userProfile });
      
      if (!user) {
        log("[NAV] 🚫 No user - showing AuthStack");
        return false; // Not logged in
      }
      
      if (!userProfile) {
        log("[NAV] 👤 No profile document - showing onboarding");
        return true; // New user, no profile document
      }
      
      // Additional safety checks for userProfile
      if (typeof userProfile !== 'object' || Array.isArray(userProfile)) {
        log("[NAV] ⚠️ Invalid userProfile type, showing onboarding");
        return true;
      }
      
      // Check if profile is complete with null/undefined safety
      const hasEssentialFields = Boolean(
        userProfile.gender && 
        userProfile.age && 
        userProfile.height && 
        userProfile.weight && 
        userProfile.goal
      );
      
      const shouldShowOnboard = !userProfile.profileCompleted || !hasEssentialFields;
      
      if (__DEV__) {
        log('🎯 shouldShowOnboarding decision:', {
          profileCompleted: userProfile.profileCompleted,
          hasEssentialFields,
          shouldShowOnboard,
          userProfile: {
            gender: userProfile.gender || 'missing',
            age: userProfile.age || 'missing',
            height: userProfile.height || 'missing',
            weight: userProfile.weight || 'missing',
            goal: userProfile.goal || 'missing'
          }
        });
      }
      
      return shouldShowOnboard;
    } catch (error) {
      logError('🔥 Error in shouldShowOnboarding:', error);
      // Default to showing onboarding on error
      return true;
    }
  };

  // Enhanced retry handler for initialization errors
  const handleRetryInitialization = () => {
    log('🔄 Retrying RootNavigator initialization...');
    setInitializationError(null);
    setAuthError(null);
    setIsLoading(true);
    
    // Force re-initialization by toggling a state that will trigger useEffect
    setTimeout(() => {
      window.location?.reload?.() || log('Manual restart required');
    }, 100);
  };

  // Show initialization error if navigation setup failed
  if (initializationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Navigation Error</Text>
        <Text style={styles.errorMessage}>
          Failed to initialize app navigation. Please try again.
        </Text>
        {__DEV__ && (
          <Text style={styles.errorDetails}>
            {initializationError.toString()}
          </Text>
        )}
        <TouchableOpacity style={styles.retryButton} onPress={handleRetryInitialization}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show auth error state with fallback to AuthStack
  if (authError) {
    log('⚠️ Auth error detected, falling back to AuthStack:', authError);
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  // Show loading indicator while initializing
  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Main navigation logic with error boundary protection
  return (
    <ErrorBoundary FallbackComponent={NavigationErrorFallback}>
      <NavigationContainer>
        <ErrorBoundary FallbackComponent={NavigationErrorFallback}>
          {user ? (
            shouldShowOnboarding() ? (
              <ErrorBoundary FallbackComponent={NavigationErrorFallback}>
                <AuthStack />
              </ErrorBoundary>
            ) : (
              <ErrorBoundary FallbackComponent={NavigationErrorFallback}>
                <AppStack />
              </ErrorBoundary>
            )
          ) : (
            <ErrorBoundary FallbackComponent={NavigationErrorFallback}>
              <AuthStack />
            </ErrorBoundary>
          )}
        </ErrorBoundary>
      </NavigationContainer>
    </ErrorBoundary>
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
    fontFamily: 'Courier',
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
    textAlign: 'center',
  },
});

