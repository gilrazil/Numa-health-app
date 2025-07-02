import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// MINIMAL APP - Just show text, no Firebase, no navigation, nothing else
export default function App() {
  // Send a beacon immediately
  try {
    fetch('https://webhook.site/0c8c4a7e-33bb-4ea7-a5b6-0129f69d57a0', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        event: 'MINIMAL APP LOADED',
        timestamp: new Date().toISOString()
      })
    }).catch(() => {});
  } catch (e) {}

  return (
    <View style={styles.container}>
      <Text style={styles.text}>MINIMAL APP WORKING - BUILD 15</Text>
      <Text style={styles.text}>No Firebase</Text>
      <Text style={styles.text}>No Navigation</Text>
      <Text style={styles.text}>Just Text</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF0000', // Red background to be VERY visible
  },
  text: {
    fontSize: 24,
    color: '#FFFFFF',
    marginVertical: 10,
    fontWeight: 'bold',
  },
}); 