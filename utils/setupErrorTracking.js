import { LogBox } from 'react-native';

// Global error logging utility
export const setupGlobalErrorTracking = () => {
  // Store original handler to prevent conflicts
  const originalHandler = ErrorUtils.getGlobalHandler();
  
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.log("🔥 Unhandled error:", error.message);
    console.log("🔥 Is fatal:", isFatal);
    console.log("🔥 Stack:", error.stack);
    console.log("🔥 Error name:", error.name);
    console.log("🔥 Component stack:", error.componentStack);
    
    // Log additional context for debugging
    console.log("🔥 Time:", new Date().toISOString());
    console.log("🔥 Platform:", require('react-native').Platform.OS);
    console.log("🔥 Dev mode:", __DEV__);
    
    // If you're using Sentry, you can log to Sentry here
    // Sentry.captureException(error);
    
    // Call original handler to maintain React Native's error handling
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
  
  // Optional: reduce noise in development (comment out if you want to see all logs)
  if (!__DEV__) {
    LogBox.ignoreAllLogs();
  }
  
  console.log("✅ Global error tracking initialized");
};

// Additional debug logging for specific error types
export const logComponentError = (componentName, error, errorInfo) => {
  console.log(`🔥 Component Error in ${componentName}:`, error.message);
  console.log("🔥 Error Info:", errorInfo);
  console.log("🔥 Component Stack:", errorInfo.componentStack);
};

// Network error logging
export const logNetworkError = (url, error) => {
  console.log("🔥 Network Error:", url);
  console.log("🔥 Error details:", error);
};

// Navigation error logging
export const logNavigationError = (routeName, error) => {
  console.log("🔥 Navigation Error:", routeName);
  console.log("🔥 Error details:", error);
}; 