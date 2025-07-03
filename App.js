import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { initializeApp } from 'firebase/app';

// Firebase configuration with iOS native API key
const firebaseConfig = {
  apiKey: "AIzaSyCF8WSck4p793ZjWETvvfiQ7EXng8FTmMM",
  authDomain: "numa-app-34ede.firebaseapp.com",
  projectId: "numa-app-34ede",
  storageBucket: "numa-app-34ede.firebasestorage.app",
  messagingSenderId: "650800257848",
  appId: "1:650800257848:ios:4baae90c17dc1f9ad52a1a"
};

// Simple Firebase initialization
console.log("🔥 Initializing Firebase...");
initializeApp(firebaseConfig);
console.log("✅ Firebase initialized!");

export default function App() {
  console.log("🟢 BUILD 20: SafeAreaProvider + initialMetrics");
  console.log("📱 Initial Metrics:", initialWindowMetrics);
  
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.container}>
        <Text style={styles.title}>BUILD 20 🎯</Text>
        <Text style={styles.subtitle}>SafeAreaProvider + initialMetrics</Text>
        <Text style={styles.status}>✅ Firebase Working</Text>
        <Text style={styles.status}>🛡️ Using initialMetrics fix</Text>
        <Text style={styles.debug}>Initial Metrics: {JSON.stringify(initialWindowMetrics)}</Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35', // Orange background for Build 20
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  debug: {
    fontSize: 12,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
}); 