import React, { useState, useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { AuthStack } from "./AuthStack";
import { AppStack } from "./AppStack";
import { AuthenticatedUserContext } from "../providers";
import { LoadingIndicator } from "../components";
import { auth, db } from "../config";

export const RootNavigator = () => {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuthStateChanged = onAuthStateChanged(auth,
      async (authenticatedUser) => {
        try {
          if (!isMounted) return; // Prevent state updates on unmounted component
          
          setUser(authenticatedUser);
          setAuthError(null); // Clear any previous errors
          
          if (authenticatedUser) {
            // Check user profile completion status
            await checkUserProfile(authenticatedUser);
          } else {
            if (isMounted) {
              setUserProfile(null);
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          if (isMounted) {
            setAuthError('Authentication error occurred');
            setIsLoading(false);
          }
        }
      },
      (error) => {
        // Handle auth errors
        console.error('Firebase auth error:', error);
        if (isMounted) {
          setAuthError('Firebase authentication failed');
          setIsLoading(false);
        }
      }
    );

    // Cleanup function
    return () => {
      isMounted = false;
      unsubscribeAuthStateChanged();
    };
  }, []);

  const checkUserProfile = async (user) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Ensure userData is valid before setting
        if (userData && typeof userData === 'object') {
          setUserProfile(userData);
          
          console.log('🔍 Profile check:', { 
            profileCompleted: userData.profileCompleted,
            hasEssentialFields: !!(userData.gender && userData.age && userData.height && userData.weight && userData.goal)
          });
        } else {
          console.log('⚠️ Invalid user data received');
          setUserProfile(null);
        }
      } else {
        console.log('👤 New user - no profile document');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowOnboarding = () => {
    if (!user) {
      console.log('🚫 No user - showing AuthStack');
      return false; // Not logged in
    }
    if (!userProfile) {
      console.log('👤 No profile document - showing onboarding');
      return true; // New user, no profile document
    }
    
    // Additional safety checks for userProfile
    if (typeof userProfile !== 'object') {
      console.log('⚠️ Invalid userProfile type');
      return true;
    }
    
    // Check if profile is complete
    const hasEssentialFields = userProfile.gender && 
                              userProfile.age && 
                              userProfile.height && 
                              userProfile.weight && 
                              userProfile.goal;
    
    const shouldShowOnboard = !userProfile.profileCompleted || !hasEssentialFields;
    
    console.log('🎯 shouldShowOnboarding decision:', {
      profileCompleted: userProfile.profileCompleted,
      hasEssentialFields,
      shouldShowOnboard,
      userProfile: {
        gender: userProfile.gender,
        age: userProfile.age,
        height: userProfile.height,
        weight: userProfile.weight,
        goal: userProfile.goal
      }
    });
    
    return shouldShowOnboard;
  };

  // Show error state if auth failed
  if (authError) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <NavigationContainer>
      {user ? (
        shouldShowOnboarding() ? <AuthStack /> : <AppStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

