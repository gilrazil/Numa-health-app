import React, { useState, createContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

console.log("[PROVIDER] 🏗️ AuthenticatedUserProvider module loaded");
console.log("[PROVIDER] 📦 Firebase Auth imports loaded");

export const AuthenticatedUserContext = createContext({
  user: null,
  setUser: () => {},
  isLoading: true,
});

console.log("[PROVIDER] 📦 AuthenticatedUserContext created");

export const AuthenticatedUserProvider = ({ children, auth }) => {
  console.log("[PROVIDER] 🚀 AuthenticatedUserProvider component called");
  console.log("[PROVIDER] 👶 Children prop received:", !!children);
  console.log("[PROVIDER] 🔐 Auth prop received:", !!auth);
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  console.log("[PROVIDER] 🎯 User state initialized - user: null, isLoading: true");

  // Firebase Auth state listener
  useEffect(() => {
    console.log("[AUTH] ⚡ AuthenticatedUserProvider useEffect triggered");
    console.log("[AUTH] 🔐 Setting up Firebase Auth state listener...");
    
    if (!auth) {
      console.error("[AUTH] ❌ No auth instance provided");
      setIsLoading(false);
      return;
    }

    console.log("[AUTH] ✅ Auth instance available, subscribing to state changes");
    
    let unsubscribe = null;
    
    try {
      console.log("[AUTH] 📡 Subscribing to Firebase Auth state");
      
      unsubscribe = onAuthStateChanged(auth, 
        (authenticatedUser) => {
          try {
            console.log("[AUTH] 🔔 Auth state change triggered");
            console.log("[AUTH] 👤 Authenticated user:", authenticatedUser ? `${authenticatedUser.email || authenticatedUser.uid}` : 'null');
            
            if (authenticatedUser) {
              console.log("[AUTH] ✅ User is logged in");
              console.log("[AUTH] 📧 User email:", authenticatedUser.email || 'No email');
              console.log("[AUTH] 🆔 User UID:", authenticatedUser.uid);
              console.log("[AUTH] ✅ Email verified:", authenticatedUser.emailVerified);
            } else {
              console.log("[AUTH] 🚪 User is logged out");
            }
            
            setUser(authenticatedUser);
            setIsLoading(false);
            console.log("[AUTH] ✅ User state updated successfully");
            console.log("[AUTH] 🎯 Current user:", authenticatedUser ? `${authenticatedUser.email || authenticatedUser.uid}` : 'null');
            
          } catch (error) {
            console.error('[AUTH] 🔥 Error in auth state change handler:', error);
            console.error('[AUTH] 🔥 Auth error stack:', error.stack);
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('[AUTH] 🔥 Firebase Auth error:', error);
          console.error('[AUTH] 🔥 Auth error code:', error.code);
          console.error('[AUTH] 🔥 Auth error message:', error.message);
          setIsLoading(false);
        }
      );
      
      console.log("[AUTH] ✅ Firebase Auth state listener configured successfully");
      
    } catch (err) {
      console.error('[AUTH] 🔥 Firebase Auth subscription error:', err.message);
      console.error('[AUTH] 🔥 Auth subscription error details:', err);
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      console.log("[AUTH] 🧹 Cleaning up Firebase Auth listener");
      if (unsubscribe) {
        try {
          unsubscribe();
          console.log("[AUTH] ✅ Auth listener unsubscribed successfully");
        } catch (error) {
          console.error('[AUTH] ⚠️ Error unsubscribing from auth:', error);
        }
      }
    };
  }, [auth]);

  // Ensure setUser is always a function
  const safeSetUser = (newUser) => {
    try {
      console.log("[PROVIDER] 👤 safeSetUser called with:", newUser ? `User ${newUser.email || newUser.uid}` : 'null');
      setUser(newUser);
      console.log("[PROVIDER] ✅ User state updated successfully");
    } catch (error) {
      console.error('[PROVIDER] 🔥 Error setting user:', error);
      console.error('[PROVIDER] 🔥 Error stack:', error.stack);
    }
  };

  const contextValue = {
    user,
    setUser: safeSetUser,
    isLoading,
  };

  console.log("[PROVIDER] 🎁 Context value prepared:", { 
    hasUser: !!user, 
    hasSetUser: !!contextValue.setUser,
    isLoading,
    userEmail: user?.email || 'none'
  });
  console.log("[PROVIDER] 🔄 About to render AuthenticatedUserContext.Provider");

  return (
    <AuthenticatedUserContext.Provider value={contextValue}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
