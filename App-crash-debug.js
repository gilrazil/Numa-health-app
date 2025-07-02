import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

// ABSOLUTE MINIMAL APP - NO EXPO MODULES, NO FIREBASE, NOTHING
export default function App() {
  React.useEffect(() => {
    // Test if we can even reach JavaScript execution
    console.log('=== JS EXECUTED ===');
    setTimeout(() => {
      Alert.alert('SUCCESS', 'JavaScript is working!');
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRASH DEBUG APP</Text>
      <Text style={styles.subtitle}>Build 15 - No Dependencies</Text>
      <Text style={styles.status}>If you see this, JS is working</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00FF00', // Bright green to be unmistakable
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#666666',
  },
}); 