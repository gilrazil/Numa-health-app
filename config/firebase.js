// Firebase v9 configuration with production-safe initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { log, logError, logCritical } from '../utils/logger';

log("[FIREBASE] 🏗️ Firebase module loaded - Starting initialization process");

// Production-safe Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwdZ-r61PbfPEE1UVQfTvAQMrBQhQGvC8",
  authDomain: "numa-app-34ede.firebaseapp.com",
  projectId: "numa-app-34ede",
  storageBucket: "numa-app-34ede.firebasestorage.app",
  messagingSenderId: "859592733394",
  appId: "1:859592733394:web:3cfc8ebd8e7a99b82fb30b"
};

log("[FIREBASE] 📋 Firebase config object created");
log("[FIREBASE] 🔑 Config validation - API Key exists:", !!firebaseConfig.apiKey);
log("[FIREBASE] 🔑 Config validation - Project ID:", firebaseConfig.projectId);

// Production-safe Firebase initialization with logging
log("[FIREBASE] 🚀 Starting Firebase app initialization...");

let app;
try {
  // Check if Firebase is already initialized
  const existingApps = getApps();
  log("[FIREBASE] 🔍 Checking existing Firebase apps");
  log("[FIREBASE] 📊 Existing apps count:", existingApps.length);
  
  if (existingApps.length === 0) {
    log("[FIREBASE] 🆕 No existing apps found - initializing new Firebase app...");
    app = initializeApp(firebaseConfig);
    log("[FIREBASE] ✅ Firebase app initialized successfully");
  } else {
    log("[FIREBASE] ♻️ Using existing Firebase app");
    app = getApp();
    log("[FIREBASE] ✅ Existing Firebase app retrieved");
  }
  
  log("[FIREBASE] 📱 App name:", app.name);
  log("[FIREBASE] ⚙️ App options exist:", !!app.options);
  log("[FIREBASE] 🎯 App initialization completed successfully");
} catch (initError) {
  logCritical("[FIREBASE] 🔥 Firebase app initialization failed:", initError);
  logError("[FIREBASE] 🔥 Initialization error details:", {
    message: initError.message,
    code: initError.code,
    stack: initError.stack
  });
  throw new Error(`Firebase initialization failed: ${initError.message}`);
}

// Initialize services with error handling
log("[FIREBASE] 🔧 Starting Firebase services initialization...");

let auth, db;

// Initialize Auth service
try {
  log("[FIREBASE] 🔐 Initializing Firebase Auth service...");
  auth = getAuth(app);
  log("[FIREBASE] ✅ Firebase Auth initialized successfully");
  log("[FIREBASE] 🔐 Auth service available:", !!auth);
  log("[FIREBASE] 🔗 Auth app reference:", !!auth.app);
} catch (authError) {
  logCritical("[FIREBASE] 🔥 Firebase Auth initialization failed:", authError);
  logError("[FIREBASE] 🔥 Auth error details:", {
    message: authError.message,
    code: authError.code,
    stack: authError.stack
  });
  throw new Error(`Firebase Auth initialization failed: ${authError.message}`);
}

// Initialize Firestore service
try {
  log("[FIREBASE] 🔥 Initializing Firebase Firestore service...");
  db = getFirestore(app);
  log("[FIREBASE] ✅ Firebase Firestore initialized successfully");
  log("[FIREBASE] 🗄️ Firestore service available:", !!db);
  log("[FIREBASE] 🔗 Firestore app reference:", !!db.app);
} catch (firestoreError) {
  logCritical("[FIREBASE] 🔥 Firebase Firestore initialization failed:", firestoreError);
  logError("[FIREBASE] 🔥 Firestore error details:", {
    message: firestoreError.message,
    code: firestoreError.code,
    stack: firestoreError.stack
  });
  throw new Error(`Firebase Firestore initialization failed: ${firestoreError.message}`);
}

log("[FIREBASE] 🎉 All Firebase services initialized successfully");

// Validation function for production safety
export const validateFirebaseServices = () => {
  log("[FIREBASE] 🔍 Running Firebase services validation...");
  
  const validation = {
    appInitialized: !!app && !!app.name,
    authInitialized: !!auth && !!auth.app,
    dbInitialized: !!db && !!db.app,
    totalApps: getApps().length
  };
  
  log("[FIREBASE] 📊 Validation results:", validation);
  
  if (!validation.appInitialized) {
    logError("[FIREBASE] ❌ App validation failed");
    throw new Error("Firebase app not properly initialized");
  }
  
  if (!validation.authInitialized) {
    logError("[FIREBASE] ❌ Auth validation failed");
    throw new Error("Firebase Auth not properly initialized");
  }
  
  if (!validation.dbInitialized) {
    logError("[FIREBASE] ❌ Firestore validation failed");
    throw new Error("Firebase Firestore not properly initialized");
  }
  
  log("[FIREBASE] ✅ All Firebase services validated successfully");
  return validation;
};

log("[FIREBASE] 📤 Exporting Firebase services: auth, db");
export { auth, db };

// Initialize Analytics (only on supported platforms)
let analytics = null;
try {
  if (typeof window !== 'undefined') {
    log("[FIREBASE] 📊 Initializing Firebase Analytics (web platform detected)...");
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        log("[FIREBASE] ✅ Firebase Analytics initialized successfully");
      } else {
        log("[FIREBASE] ⚠️ Firebase Analytics not supported on this platform");
      }
    }).catch((analyticsError) => {
      logError("[FIREBASE] 🔥 Analytics support check failed:", analyticsError);
    });
  } else {
    log("[FIREBASE] 📱 Skipping Firebase Analytics (not web platform)");
  }
} catch (analyticsError) {
  logError("[FIREBASE] 🔥 Firebase Analytics initialization failed:", analyticsError);
  logError("[FIREBASE] 🔥 Analytics error details:", {
    message: analyticsError.message,
    code: analyticsError.code,
    stack: analyticsError.stack
  });
}

export { analytics };
export default app;

log("[FIREBASE] 🏁 Firebase configuration module completed successfully");

