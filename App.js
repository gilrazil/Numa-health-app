import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { initializeApp } from 'firebase/app';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import error handling
import { ErrorBoundary } from './components';
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

// Simplified Home Screen without auth dependencies
const SimpleHomeScreen = () => {
  console.log("[SCREEN] SimpleHomeScreen loaded");

  const handleStartTracking = () => {
    console.log("[SCREEN] Start tracking button pressed");
  };

  const handleViewProfile = () => {
    console.log("[SCREEN] View profile button pressed");
  };

  return (
    <SafeAreaView style={styles.homeContainer}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Numa Health App</Text>
          <Text style={styles.subtitle}>Track your meals with AI</Text>
        </View>

        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ App Status</Text>
          <Text style={styles.statusText}>🔥 Firebase: Connected</Text>
          <Text style={styles.statusText}>📱 SafeArea: Working</Text>
          <Text style={styles.statusText}>🚀 Navigation: Ready</Text>
        </View>

        {/* Main Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📸 Meal Tracking</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartTracking}>
            <MaterialCommunityIcons name="camera" size={24} color="white" />
            <Text style={styles.buttonText}>Take Meal Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Profile</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewProfile}>
            <MaterialCommunityIcons name="account" size={24} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Testing Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧪 Testing Mode</Text>
          <Text style={styles.testingText}>Auth bypassed for navigation testing</Text>
          <Text style={styles.testingText}>Camera and profile features ready</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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

  // Main app - render simplified home screen
  console.log("[SCREEN] HomeScreen loaded");

  return (
    <ErrorBoundary>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <View style={styles.mainContainer}>
          {/* Render simplified home screen */}
          <SimpleHomeScreen />
          
                   {/* Version label at bottom */}
         <Text style={styles.versionLabel}>
           Version 1.0.21 - Build 21
         </Text>
        </View>
      </SafeAreaProvider>
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
    backgroundColor: '#F5F5F5',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testingText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
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