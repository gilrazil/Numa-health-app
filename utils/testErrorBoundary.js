import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Simple component that can trigger errors for testing ErrorBoundary
export const TestErrorComponent = ({ shouldError = false }) => {
  if (shouldError) {
    throw new Error('Test error for ErrorBoundary validation');
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ErrorBoundary test component loaded successfully</Text>
    </View>
  );
};

// Component with a button to trigger errors
export const ErrorBoundaryTester = () => {
  const [shouldError, setShouldError] = React.useState(false);
  
  const triggerError = () => {
    console.log('🧪 Triggering test error for ErrorBoundary');
    setShouldError(true);
  };
  
  return (
    <View style={styles.testerContainer}>
      <Text style={styles.testerTitle}>ErrorBoundary Tester</Text>
      <TouchableOpacity style={styles.errorButton} onPress={triggerError}>
        <Text style={styles.errorButtonText}>Trigger Test Error</Text>
      </TouchableOpacity>
      <TestErrorComponent shouldError={shouldError} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    margin: 10,
  },
  text: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  testerContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  testerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  errorButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 