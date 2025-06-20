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

  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuthStateChanged = onAuthStateChanged(auth,
      async (authenticatedUser) => {
        setUser(authenticatedUser);
        
        if (authenticatedUser) {
          // Check user profile completion status
          await checkUserProfile(authenticatedUser);
        } else {
          setUserProfile(null);
          setIsLoading(false);
        }
      }
    );

    // unsubscribe auth listener on unmount
    return unsubscribeAuthStateChanged;
  }, []);

  const checkUserProfile = async (user) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        
        console.log('🔍 Profile check:', { 
          profileCompleted: userData.profileCompleted,
          hasEssentialFields: !!(userData.gender && userData.age && userData.height && userData.weight && userData.goal)
        });
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
    if (!user) return false; // Not logged in
    if (!userProfile) return true; // New user, no profile document
    
    // Check if profile is complete
    const hasEssentialFields = userProfile.gender && 
                              userProfile.age && 
                              userProfile.height && 
                              userProfile.weight && 
                              userProfile.goal;
    
    return !userProfile.profileCompleted || !hasEssentialFields;
  };

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

