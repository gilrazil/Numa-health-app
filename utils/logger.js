// Custom logger that only logs in development mode
export const log = (...args) => {
  if (__DEV__) {
    console.log(...args);
  }
};

export const logError = (...args) => {
  if (__DEV__) {
    console.error(...args);
  }
};

export const logWarn = (...args) => {
  if (__DEV__) {
    console.warn(...args);
  }
};

// For critical errors that should be logged even in production
// but in a safe way that won't crash the app
export const logCritical = (message, error = null) => {
  try {
    if (__DEV__) {
      console.error(message, error);
    } else {
      // In production, only log the message string, not complex objects
      console.error(message);
    }
  } catch (e) {
    // Fail silently in production
  }
}; 