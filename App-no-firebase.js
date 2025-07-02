import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// NO FIREBASE IMPORTS AT ALL

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NO FIREBASE TEST</Text>
      <Text style={styles.subtitle}>Build 15 - Firebase Removed</Text>
      <Text style={styles.status}>Testing if Firebase was causing crashes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF0000', // Red background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    color: '#FFDDDD',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#FFCCCC',
  },
}); 