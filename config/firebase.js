// Firebase v9 configuration with production-safe initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

console.log("[FIREBASE] 🏗️ Firebase module loaded - Starting initialization process");
console.log("[FIREBASE] 🚀 ON-SCREEN DEBUG: Firebase config loading...");

// Production-safe Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwdZ-r61PbfPEE1UVQfTvAQMrBQhQGvC8",
  authDomain: "numa-app-34ede.firebaseapp.com",
  projectId: "numa-app-34ede",
  storageBucket: "numa-app-34ede.firebasestorage.app",
  messagingSenderId: "859592733394",
  appId: "1:859592733394:web:3cfc8ebd8e7a99b82fb30b"
};

console.log("[FIREBASE] 📋 Firebase config object created");
console.log("[FIREBASE] 🔑 Config validation - API Key exists:", !!firebaseConfig.apiKey);
console.log("[FIREBASE] 🔑 Config validation - Project ID:", firebaseConfig.projectId);

// Production-safe Firebase initialization with logging
console.log("[FIREBASE] 🚀 Starting Firebase app initialization...");

let app;
try {
  // Check if Firebase is already initialized
  const existingApps = getApps();
  console.log("[FIREBASE] 🔍 Checking existing Firebase apps");
  console.log("[FIREBASE] 📊 Existing apps count:", existingApps.length);
  
  if (existingApps.length === 0) {
    console.log("[FIREBASE] 🆕 No existing apps found - initializing new Firebase app...");
    app = initializeApp(firebaseConfig);
    console.log("[FIREBASE] ✅ Firebase app initialized successfully");
  } else {
    console.log("[FIREBASE] ♻️ Using existing Firebase app");
    app = getApp();
    console.log("[FIREBASE] ✅ Existing Firebase app retrieved");
  }
  
  console.log("[FIREBASE] 📱 App name:", app.name);
  console.log("[FIREBASE] ⚙️ App options exist:", !!app.options);
  console.log("[FIREBASE] 🎯 App initialization completed successfully");
} catch (initError) {
  console.error("[FIREBASE] 🔥 Firebase app initialization failed:", initError);
  console.error("[FIREBASE] 🔥 Initialization error details:", {
    message: initError.message,
    code: initError.code,
    stack: initError.stack
  });
  throw new Error(`Firebase initialization failed: ${initError.message}`);
}

// Initialize services with error handling
console.log("[FIREBASE] 🔧 Starting Firebase services initialization...");

let auth, db;

// Initialize Auth service
try {
  console.log("[FIREBASE] 🔐 Initializing Firebase Auth service...");
  auth = getAuth(app);
  console.log("[FIREBASE] ✅ Firebase Auth initialized successfully");
  console.log("[FIREBASE] 🔐 Auth service available:", !!auth);
  console.log("[FIREBASE] 🔗 Auth app reference:", !!auth.app);
} catch (authError) {
  console.error("[FIREBASE] 🔥 Firebase Auth initialization failed:", authError);
  console.error("[FIREBASE] 🔥 Auth error details:", {
    message: authError.message,
    code: authError.code,
    stack: authError.stack
  });
  throw new Error(`Firebase Auth initialization failed: ${authError.message}`);
}

// Initialize Firestore service
try {
  console.log("[FIREBASE] 🔥 Initializing Firebase Firestore service...");
  db = getFirestore(app);
  console.log("[FIREBASE] ✅ Firebase Firestore initialized successfully");
  console.log("[FIREBASE] 🗄️ Firestore service available:", !!db);
  console.log("[FIREBASE] 🔗 Firestore app reference:", !!db.app);
} catch (firestoreError) {
  console.error("[FIREBASE] 🔥 Firebase Firestore initialization failed:", firestoreError);
  console.error("[FIREBASE] 🔥 Firestore error details:", {
    message: firestoreError.message,
    code: firestoreError.code,
    stack: firestoreError.stack
  });
  throw new Error(`Firebase Firestore initialization failed: ${firestoreError.message}`);
}

console.log("[FIREBASE] 🎉 All Firebase services initialized successfully");

// Validation function for production safety
export const validateFirebaseServices = () => {
  console.log("[FIREBASE] 🔍 Running Firebase services validation...");
  
  const validation = {
    appInitialized: !!app && !!app.name,
    authInitialized: !!auth && !!auth.app,
    dbInitialized: !!db && !!db.app,
    totalApps: getApps().length
  };
  
  console.log("[FIREBASE] 📊 Validation results:", validation);
  
  if (!validation.appInitialized) {
    console.error("[FIREBASE] ❌ App validation failed");
    throw new Error("Firebase app not properly initialized");
  }
  
  if (!validation.authInitialized) {
    console.error("[FIREBASE] ❌ Auth validation failed");
    throw new Error("Firebase Auth not properly initialized");
  }
  
  if (!validation.dbInitialized) {
    console.error("[FIREBASE] ❌ Firestore validation failed");
    throw new Error("Firebase Firestore not properly initialized");
  }
  
  console.log("[FIREBASE] ✅ All Firebase services validated successfully");
  return validation;
};

console.log("[FIREBASE] 📤 Exporting Firebase services: auth, db");
export { auth, db };

// Initialize Analytics (only on supported platforms)
let analytics = null;
try {
  if (typeof window !== 'undefined') {
    console.log("[FIREBASE] 📊 Initializing Firebase Analytics (web platform detected)...");
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log("[FIREBASE] ✅ Firebase Analytics initialized successfully");
      } else {
        console.log("[FIREBASE] ⚠️ Firebase Analytics not supported on this platform");
      }
    }).catch((analyticsError) => {
      console.error("[FIREBASE] 🔥 Analytics support check failed:", analyticsError);
    });
  } else {
    console.log("[FIREBASE] 📱 Skipping Firebase Analytics (not web platform)");
  }
} catch (analyticsError) {
  console.error("[FIREBASE] 🔥 Firebase Analytics initialization failed:", analyticsError);
  console.error("[FIREBASE] 🔥 Analytics error details:", {
    message: analyticsError.message,
    code: analyticsError.code,
    stack: analyticsError.stack
  });
}

export { analytics };
export default app;

console.log("[FIREBASE] 🏁 Firebase configuration module completed successfully");

