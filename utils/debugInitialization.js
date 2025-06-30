import { Platform } from 'react-native';

// Initialization debug logger
export const logInitializationStep = (step, details = {}) => {
  const timestamp = new Date().toISOString();
  const platform = Platform.OS;
  
  console.log(`🚀 [${timestamp}] INIT: ${step}`);
  console.log(`📱 Platform: ${platform}`);
  console.log(`🔧 Dev mode: ${__DEV__}`);
  
  if (Object.keys(details).length > 0) {
    console.log(`📊 Details:`, details);
  }
  
  // Also log to a structured format for easier parsing
  console.log(JSON.stringify({
    timestamp,
    platform,
    step,
    details,
    devMode: __DEV__
  }));
};

// Component mount/unmount logger
export const logComponentLifecycle = (componentName, action, details = {}) => {
  const timestamp = new Date().toISOString();
  
  console.log(`🧩 [${timestamp}] ${componentName}: ${action}`);
  
  if (Object.keys(details).length > 0) {
    console.log(`📊 Details:`, details);
  }
};

// Navigation state logger
export const logNavigationState = (state, previousState = null) => {
  const timestamp = new Date().toISOString();
  
  console.log(`🧭 [${timestamp}] Navigation State Change:`);
  console.log(`📍 Current:`, state);
  
  if (previousState) {
    console.log(`📍 Previous:`, previousState);
  }
};

// Firebase connection logger
export const logFirebaseConnection = (service, status, error = null) => {
  const timestamp = new Date().toISOString();
  
  console.log(`🔥 [${timestamp}] Firebase ${service}: ${status}`);
  
  if (error) {
    console.log(`❌ Error:`, error);
  }
};

// Performance logger
export const logPerformanceMetric = (metric, value, unit = 'ms') => {
  const timestamp = new Date().toISOString();
  
  console.log(`⚡ [${timestamp}] Performance: ${metric} = ${value}${unit}`);
};

// Memory usage logger (if available)
export const logMemoryUsage = () => {
  const timestamp = new Date().toISOString();
  
  if (performance && performance.memory) {
    const memory = performance.memory;
    console.log(`💾 [${timestamp}] Memory Usage:`);
    console.log(`💾 Used: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
    console.log(`💾 Total: ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`);
    console.log(`💾 Limit: ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`);
  }
}; 