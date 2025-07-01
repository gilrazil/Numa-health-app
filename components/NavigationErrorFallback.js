import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { Colors } from '../config';
import { logNavigationError } from '../utils/setupErrorTracking';
import { log, logError, logWarn } from '../utils/logger';

export const NavigationErrorFallback = ({ error, retry }) => {
  useEffect(() => {
    // Log navigation error when component mounts
    if (error) {
      logNavigationError('NavigationErrorFallback', error);
    }
  }, [error]);

  const handleRetry = async () => {
    log('🔄 NavigationErrorFallback: Retry requested');
    
    try {
      // First try the provided retry function
      if (retry && typeof retry === 'function') {
        retry();
      }
      
      // If we're in a production build, also try to reload the app
      if (!__DEV__ && Updates.isEnabled) {
        log('🔄 NavigationErrorFallback: Attempting app reload...');
        await Updates.reloadAsync();
      }
    } catch (reloadError) {
      logError('🔥 NavigationErrorFallback: Reload failed:', reloadError);
      // If reload fails and we have a retry function, call it
      if (retry && typeof retry === 'function') {
        retry();
      }
    }
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name="navigation-variant" 
        size={64} 
        color="#007AFF" 
        style={styles.icon}
      />
      <Text style={styles.title}>Navigation Error</Text>
      <Text style={styles.message}>
        There was a problem loading this screen. Don't worry, this is temporary.
      </Text>
      
      {/* Always show some error info for debugging */}
      <View style={styles.errorDetails}>
        <Text style={styles.errorTitle}>
          {__DEV__ ? 'Error Details (Debug):' : 'Navigation issue detected'}
        </Text>
        {__DEV__ && error && (
          <Text style={styles.errorText}>{error.toString()}</Text>
        )}
        {!__DEV__ && (
          <Text style={styles.errorText}>
            Please try again or restart the app if this persists.
          </Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
      
      <Text style={styles.helpText}>
        If this keeps happening, please restart the app.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF', // Hard-coded white background
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000', // Hard-coded black text
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666', // Hard-coded gray text
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#F5F5F5', // Hard-coded light gray
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    maxHeight: 150,
    overflow: 'hidden',
    minWidth: '80%',
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF4444', // Hard-coded red
    marginBottom: 4,
  },
  errorText: {
    fontSize: 10,
    color: '#333333', // Hard-coded dark gray
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  retryButton: {
    backgroundColor: '#007AFF', // Hard-coded blue
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 120,
  },
  retryButtonText: {
    color: '#FFFFFF', // Hard-coded white text
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 12,
    color: '#666666', // Hard-coded gray text
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 