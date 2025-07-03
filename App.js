import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { initializeApp } from 'firebase/app';

// Import the ACTUAL HomeScreen component and dependencies
import { HomeScreen } from './screens/HomeScreen';
import { ErrorBoundary } from './components';
import { AuthenticatedUserProvider } from './providers';
import { setupGlobalErrorTracking } from './utils/setupErrorTracking';

// Firebase configuration with iOS native API key (working from Build 20)
const firebaseConfig = {
  apiKey: "AIzaSyCF8WSck4p793ZjWETvvfiQ7EXng8FTmMM",
  authDomain: "numa-app-34ede.firebaseapp.com",
  projectId: "numa-app-34ede",
  storageBucket: "numa-app-34ede.firebasestorage.app",
  messagingSenderId: "650800257848",
  appId: "1:650800257848:ios:4baae90c17dc1f9ad52a1a"
};

// Simple Firebase initialization (working from Build 20)
console.log("🔥 Initializing Firebase...");
initializeApp(firebaseConfig);
console.log("✅ Firebase initialized!");

export default function App() {
  console.log("[SCREEN] App component loaded");
  
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("[SCREEN] Setting up global error tracking...");
        setupGlobalErrorTracking();
        
        console.log("[SCREEN] App initialization completed");
        setIsReady(true);
      } catch (err) {
        console.error("[SCREEN] App initialization failed:", err);
        setError(err);
      }
    };

    initializeApp();
  }, []);

  // Simple error screen
  if (error) {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <View style={styles.container}>
          <Text style={styles.errorText}>App Error: {error.message}</Text>
          <Text style={styles.versionLabel}>Version 1.0.21 - Build 21</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Loading screen
  if (!isReady) {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
          <Text style={styles.versionLabel}>Version 1.0.21 - Build 21</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Main app - render ACTUAL HomeScreen with mock context
  console.log("[SCREEN] HomeScreen loaded");
  
  // Create mock navigation object for HomeScreen
  const mockNavigation = {
    navigate: (screen) => console.log(`[SCREEN] Navigation to ${screen} requested`),
    goBack: () => console.log(`[SCREEN] Go back requested`),
  };

  return (
    <ErrorBoundary>
      <AuthenticatedUserProvider>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <View style={styles.mainContainer}>
            {/* Render the ACTUAL HomeScreen component */}
            <HomeScreen navigation={mockNavigation} />
            
            {/* Version label at bottom */}
            <Text style={styles.versionLabel}>
              Version 1.0.21 - Build 21
            </Text>
          </View>
        </SafeAreaProvider>
      </AuthenticatedUserProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  versionLabel: {
    fontSize: 10,
    opacity: 0.5,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    textAlign: 'center',
  },
}); 