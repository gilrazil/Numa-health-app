import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { log, logError, logWarn } from '../utils/logger';

// Production-safe fallback component that will NEVER be invisible
export const ProductionSafeFallback = ({ error, retry, title = "Something went wrong" }) => {
  const handleReload = async () => {
    log('🔄 ProductionSafeFallback: Reload requested');
    
    try {
      // Try the retry function first if provided
      if (retry && typeof retry === 'function') {
        retry();
      }
      
      // If we're in production and Updates is available, reload
      if (!__DEV__ && Updates.isEnabled) {
        await Updates.reloadAsync();
      }
    } catch (reloadError) {
      logError('🔥 ProductionSafeFallback: Reload failed:', reloadError);
      // Last resort: just call retry if available
      if (retry && typeof retry === 'function') {
        retry();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Always visible title */}
      <Text style={styles.title}>{title}</Text>
      
      {/* Always visible message */}
      <Text style={styles.message}>
        Oops! Something went wrong.
      </Text>
      
      {/* Always visible subtitle */}
      <Text style={styles.subtitle}>
        Don't worry, this happens sometimes. Please try again.
      </Text>
      
      {/* Error details (only in dev) */}
      {__DEV__ && error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Debug Info:</Text>
          <Text style={styles.errorText} numberOfLines={5}>
            {error.toString()}
          </Text>
        </View>
      )}
      
      {/* Always visible retry button */}
      <TouchableOpacity style={styles.button} onPress={handleReload}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
      
      {/* Help text */}
      <Text style={styles.helpText}>
        If this keeps happening, please restart the app completely.
      </Text>
    </View>
  );
};

// Hard-coded styles that will never depend on theme files
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF', // Always white background
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000', // Always black text
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#333333', // Always dark gray
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666', // Always medium gray
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: '#F5F5F5', // Always light gray
    borderRadius: 8,
    padding: 15,
    marginBottom: 25,
    width: '90%',
    maxHeight: 150,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4444', // Always red
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#333333', // Always dark gray
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#007AFF', // Always blue
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 150,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF', // Always white text
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#888888', // Always light gray
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
}); 