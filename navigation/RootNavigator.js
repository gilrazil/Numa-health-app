import React, { useState, useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { AuthStack } from "./AuthStack";
import { AppStack } from "./AppStack";
import { AuthenticatedUserContext } from "../providers";
import { LoadingIndicator } from "../components";
import { auth, db } from "../config";
import { Colors } from "../config";

export const RootNavigator = () => {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [initializationError, setInitializationError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    let unsubscribeAuthStateChanged = null;
    
    // Hardened initialization with comprehensive error handling
    const initializeNavigation = async () => {
      try {
        if (__DEV__) {
          console.log('🚀 RootNavigator: Starting hardened initialization...');
        }
        
        // Ensure Firebase services are available before proceeding
        if (!auth || !db) {
          throw new Error('Firebase services not initialized');
        }

        // Setup auth state listener with enhanced error protection
        unsubscribeAuthStateChanged = onAuthStateChanged(auth,
          async (authenticatedUser) => {
            try {
              if (!isMounted) return; // Prevent state updates on unmounted component
              
              if (__DEV__) {
                console.log('🔐 Auth state changed:', authenticatedUser ? 'User logged in' : 'User logged out');
              }
              
              // Safely set user with validation
              if (authenticatedUser && typeof authenticatedUser === 'object') {
                setUser(authenticatedUser);
                setAuthError(null); // Clear any previous errors
                
                // Check user profile with additional safety
                await checkUserProfileSafely(authenticatedUser);
              } else {
                // User logged out or invalid user object
                if (isMounted) {
                  setUser(null);
                  setUserProfile(null);
                  setIsLoading(false);
                  setAuthError(null);
                }
              }
            } catch (error) {
              console.error('🔥 Auth state change error:', error);
              if (isMounted) {
                setAuthError(`Authentication error: ${error.message}`);
                setIsLoading(false);
              }
            }
          },
          (error) => {
            // Handle auth errors with enhanced logging
            console.error('🔥 Firebase auth error:', error);
            console.error('🔥 Error code:', error.code);
            console.error('🔥 Error message:', error.message);
            
            if (isMounted) {
              setAuthError(`Firebase authentication failed: ${error.message}`);
              setIsLoading(false);
            }
          }
        );

        if (__DEV__) {
          console.log('✅ RootNavigator: Auth listener initialized successfully');
        }
        
      } catch (error) {
        console.error('🔥 RootNavigator initialization error:', error);
        if (isMounted) {
          setInitializationError(error);
          setIsLoading(false);
        }
      }
    };

    // Start initialization
    initializeNavigation();

    // Cleanup function with enhanced safety
    return () => {
      if (__DEV__) {
        console.log('🧹 RootNavigator: Cleaning up...');
      }
      
      isMounted = false;
      
      try {
        if (unsubscribeAuthStateChanged) {
          unsubscribeAuthStateChanged();
        }
      } catch (error) {
        console.error('⚠️ Error during cleanup:', error);
      }
    };
  }, []);

  // Enhanced user profile checking with comprehensive error handling
  const checkUserProfileSafely = async (user) => {
    if (!user || !user.uid) {
      console.log('⚠️ Invalid user object provided to profile check');
      return;
    }
    
    try {
      if (__DEV__) {
        console.log('🔍 Checking user profile for:', user.uid);
      }

      // Ensure Firestore is available
      if (!db) {
        throw new Error('Firestore database not initialized');
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Enhanced validation of user data
        if (userData && typeof userData === 'object' && !Array.isArray(userData)) {
          setUserProfile(userData);
          
          if (__DEV__) {
            console.log('🔍 Profile check result:', { 
              profileCompleted: userData.profileCompleted,
              hasEssentialFields: !!(userData.gender && userData.age && userData.height && userData.weight && userData.goal),
              userEmail: user.email || 'No email'
            });
          }
        } else {
          console.log('⚠️ Invalid user data received from Firestore');
          setUserProfile(null);
        }
      } else {
        console.log('👤 New user - no profile document exists');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('🔥 Error checking user profile:', error);
      console.error('🔥 Error details:', {
        code: error.code,
        message: error.message,
        uid: user?.uid
      });
      
      // Set profile to null on error to trigger onboarding
      setUserProfile(null);
    } finally {
      // Always set loading to false
      if (user) { // Only if we have a user
        setIsLoading(false);
      }
    }
  };

  // Enhanced onboarding decision logic with safety checks
  const shouldShowOnboarding = () => {
    try {
      if (!user) {
        if (__DEV__) {
          console.log('🚫 No user - showing AuthStack');
        }
        return false; // Not logged in
      }
      
      if (!userProfile) {
        if (__DEV__) {
          console.log('👤 No profile document - showing onboarding');
        }
        return true; // New user, no profile document
      }
      
      // Additional safety checks for userProfile
      if (typeof userProfile !== 'object' || Array.isArray(userProfile)) {
        if (__DEV__) {
          console.log('⚠️ Invalid userProfile type, showing onboarding');
        }
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
        console.log('🎯 shouldShowOnboarding decision:', {
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
      console.error('🔥 Error in shouldShowOnboarding:', error);
      // Default to showing onboarding on error
      return true;
    }
  };

  // Enhanced retry handler for initialization errors
  const handleRetryInitialization = () => {
    console.log('🔄 Retrying RootNavigator initialization...');
    setInitializationError(null);
    setAuthError(null);
    setIsLoading(true);
    
    // Force re-initialization by toggling a state that will trigger useEffect
    setTimeout(() => {
      window.location?.reload?.() || console.log('Manual restart required');
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
    console.log('⚠️ Auth error detected, falling back to AuthStack:', authError);
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

  // Main navigation logic with try/catch protection
  try {
    return (
      <NavigationContainer>
        {user ? (
          shouldShowOnboarding() ? <AuthStack /> : <AppStack />
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    );
  } catch (error) {
    console.error('🔥 Navigation render error:', error);
    
    // Fallback to AuthStack on render error
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }
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

