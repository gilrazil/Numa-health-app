import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";

// Simple Firebase initialization - proven to work in Build 17
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your app components
import { RootNavigator } from "./navigation/RootNavigator";
import { AuthenticatedUserProvider } from "./providers";
import { ErrorBoundary } from "./components";

// Simple Firebase setup (like Build 17, but for your real app)
const firebaseConfig = {
  apiKey: "AIzaSyCF8WSck4p793ZjWETvvfiQ7EXng8FTmMM", // iOS native API key
  authDomain: "numa-app-34ede.firebaseapp.com",
  projectId: "numa-app-34ede",
  storageBucket: "numa-app-34ede.firebasestorage.app",
  messagingSenderId: "859592733394",
  appId: "1:859592733394:ios:4368fec253680f1f2fb30b"
};

// Initialize Firebase (simple, no complex error handling)
let app, auth, db;
const existingApps = getApps();
if (existingApps.length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = existingApps[0];
}

auth = getAuth(app);
db = getFirestore(app);

console.log('[BUILD 18] Firebase initialized successfully');

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('[BUILD 18] App starting with simplified Firebase');
    
    // Simple initialization - no complex error handling that was causing crashes
    const initializeApp = async () => {
      try {
        console.log('[BUILD 18] Firebase services ready');
        
        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsReady(true);
        console.log('[BUILD 18] App ready to render');
      } catch (error) {
        console.error('[BUILD 18] Initialization error:', error);
        // Simple error handling - just log and continue
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  // Show loading screen briefly
  if (!isReady) {
    return (
      <SafeAreaProvider style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingTitle}>Numa Health</Text>
          <Text style={styles.loadingMessage}>Build 18 - Simplified Firebase</Text>
          <Text style={styles.loadingSubtitle}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Render your actual app
  console.log('[BUILD 18] Rendering main app with simplified Firebase');
  
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#6B4EFF',
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
    color: '#FFFFFF',
    marginBottom: 10,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#E8F4FF',
    textAlign: 'center',
    marginBottom: 5,
  },
  loadingSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default App; 