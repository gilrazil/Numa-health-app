import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  const [status, setStatus] = useState('Starting Firebase test...');
  const [details, setDetails] = useState([]);

  useEffect(() => {
    console.log('[BUILD 17] 🧪 Starting simple Firebase test');
    
    const testFirebase = async () => {
      const logs = [];
      
      try {
        // Step 1: Test if we can import Firebase
        logs.push('✅ Step 1: Importing Firebase...');
        setStatus('Importing Firebase...');
        
        const { initializeApp, getApps } = await import('firebase/app');
        logs.push('✅ Step 1: Firebase import successful');
        
        // Step 2: Try to initialize with minimal config
        logs.push('✅ Step 2: Initializing Firebase app...');
        setStatus('Initializing Firebase...');
        
        const firebaseConfig = {
          apiKey: "AIzaSyCF8WSck4p793ZjWETvvfiQ7EXng8FTmMM", // Using iOS native API key
          projectId: "numa-app-34ede",
          appId: "1:859592733394:ios:4368fec253680f1f2fb30b"
        };
        
        const existingApps = getApps();
        if (existingApps.length === 0) {
          const app = initializeApp(firebaseConfig);
          logs.push(`✅ Step 2: Firebase initialized successfully - ${app.name}`);
        } else {
          logs.push('✅ Step 2: Firebase already initialized');
        }
        
        // Step 3: Success
        logs.push('🎉 All Firebase tests passed!');
        setStatus('✅ Firebase working!');
        
      } catch (error) {
        logs.push(`❌ Firebase test failed: ${error.message}`);
        logs.push(`❌ Error stack: ${error.stack}`);
        setStatus('❌ Firebase failed');
        
        console.error('[BUILD 17] Firebase test error:', error);
      }
      
      setDetails(logs);
    };
    
    // Add delay to see loading state
    setTimeout(testFirebase, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BUILD 17 - Firebase Test</Text>
      <Text style={styles.subtitle}>Minimal Firebase initialization test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.status}>{status}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        {details.map((detail, index) => (
          <Text key={index} style={styles.detail}>{detail}</Text>
        ))}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.info}>Using iOS native API key</Text>
        <Text style={styles.info}>GoogleService-Info.plist should be detected</Text>
        <Text style={styles.info}>If you see this screen, JS is working</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FF',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    maxHeight: 200,
  },
  detail: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
  },
  info: {
    fontSize: 12,
    color: '#E65100',
    textAlign: 'center',
    marginBottom: 5,
  },
}); 