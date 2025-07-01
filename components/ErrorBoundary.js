import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { Colors } from '../config';
import { logComponentError } from '../utils/setupErrorTracking';
import { log, logError, logWarn } from '../utils/logger';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging with context
    logError('ErrorBoundary caught an error:', error, errorInfo);
    logComponentError('ErrorBoundary', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = async () => {
    log('🔄 ErrorBoundary: Retry requested');
    
    try {
      // First try to reset the error boundary
      this.setState({ hasError: false, error: null, errorInfo: null });
      
      // If we're in a production build, try to reload the app
      if (!__DEV__ && Updates.isEnabled) {
        log('🔄 ErrorBoundary: Attempting app reload...');
        await Updates.reloadAsync();
      }
    } catch (reloadError) {
      logError('🔥 ErrorBoundary: Reload failed:', reloadError);
      // If reload fails, just reset the error boundary
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.FallbackComponent) {
        return <this.props.FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }
      
      // Default fallback UI (never blank!) - Production-safe styling
      return (
        <View style={styles.container}>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={64} 
            color="#FF4444" 
            style={styles.icon}
          />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app encountered an unexpected error. Please try again.
          </Text>
          
          {/* Always show some error info in production for debugging */}
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>
              {__DEV__ ? 'Error Details (Debug):' : 'Error occurred'}
            </Text>
            {__DEV__ && this.state.error && (
              <>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorText}>{this.state.errorInfo.componentStack}</Text>
                )}
              </>
            )}
            {!__DEV__ && (
              <Text style={styles.errorText}>
                Please restart the app or contact support if this persists.
              </Text>
            )}
          </View>
          
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000', // Hard-coded black text
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666', // Hard-coded gray text
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#F5F5F5', // Hard-coded light gray
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    maxHeight: 200,
    overflow: 'hidden',
    minWidth: '80%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4444', // Hard-coded red
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#333333', // Hard-coded dark gray
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  retryButton: {
    backgroundColor: '#007AFF', // Hard-coded blue
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonText: {
    color: '#FFFFFF', // Hard-coded white text
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 