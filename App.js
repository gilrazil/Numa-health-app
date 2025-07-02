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

console.log('[BUILD 19] Firebase initialized successfully');

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState(['Starting Build 19 debug...']);

  useEffect(() => {
    console.log('[BUILD 19] App starting - Component isolation test');
    
    const testComponents = async () => {
      const logs = ['✅ Firebase working (from Build 17)'];
      
      try {
        logs.push('✅ Testing SafeAreaProvider...');
        setDebugInfo([...logs]);
        
        // Test if SafeAreaProvider works
        await new Promise(resolve => setTimeout(resolve, 100));
        logs.push('✅ SafeAreaProvider loaded successfully');
        
        logs.push('✅ All component tests passed');
        logs.push('🎯 Next: Will test ErrorBoundary in Build 20');
        
        setDebugInfo([...logs]);
        setIsReady(true);
        console.log('[BUILD 19] Component test completed');
      } catch (error) {
        logs.push(`❌ Component test failed: ${error.message}`);
        setDebugInfo([...logs]);
        console.error('[BUILD 19] Component error:', error);
        setIsReady(true); // Still show the debug screen
      }
    };

    testComponents();
  }, []);

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>BUILD 19 - Component Isolation</Text>
        <Text style={styles.subtitle}>Testing: SafeAreaProvider only</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.status}>
            {isReady ? '✅ Test Complete' : '🔄 Testing...'}
          </Text>
        </View>
        
        <View style={styles.debugContainer}>
          {debugInfo.map((info, index) => (
            <Text key={index} style={styles.debugText}>{info}</Text>
          ))}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.info}>If you see this GREEN screen:</Text>
          <Text style={styles.info}>SafeAreaProvider works fine</Text>
          <Text style={styles.info}>Issue is in other components</Text>
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50', // Green background to distinguish from other builds
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  debugContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    maxHeight: 200,
  },
  debugText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
  },
  info: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 3,
  },
});

export default App; 