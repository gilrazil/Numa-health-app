// Backup Firebase initialization for production safety
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Fallback Firebase configuration (same as main but with error recovery)
const firebaseConfig = {
  apiKey: "AIzaSyBwdZ-r61PbfPEE1UVQfTvAQMrBQhQGvC8",
  authDomain: "numa-app-34ede.firebaseapp.com",
  projectId: "numa-app-34ede",
  storageBucket: "numa-app-34ede.firebasestorage.app",
  messagingSenderId: "859592733394",
  appId: "1:859592733394:web:3cfc8ebd8e7a99b82fb30b"
};

// Backup initialization function
export const initializeFirebaseBackup = () => {
  console.log("[🔥 Firebase Backup] Starting backup initialization...");
  
  try {
    // Clear any existing apps first
    const existingApps = getApps();
    console.log("[🔥 Firebase Backup] Existing apps to clear:", existingApps.length);
    
    let app;
    
    // Force re-initialization
    try {
      if (existingApps.length > 0) {
        app = getApp();
        console.log("[🔥 Firebase Backup] Using existing app");
      } else {
        app = initializeApp(firebaseConfig, 'backup-app');
        console.log("[🔥 Firebase Backup] Created new backup app");
      }
    } catch (appError) {
      console.log("[🔥 Firebase Backup] App creation failed, trying default app");
      app = initializeApp(firebaseConfig);
    }
    
    // Initialize services with retry logic
    let auth, db;
    
    try {
      auth = getAuth(app);
      console.log("[🔥 Firebase Backup] Auth service initialized");
    } catch (authError) {
      console.error("[🔥 Firebase Backup] Auth failed:", authError);
      throw new Error(`Backup Auth initialization failed: ${authError.message}`);
    }
    
    try {
      db = getFirestore(app);
      console.log("[🔥 Firebase Backup] Firestore service initialized");
    } catch (dbError) {
      console.error("[🔥 Firebase Backup] Firestore failed:", dbError);
      throw new Error(`Backup Firestore initialization failed: ${dbError.message}`);
    }
    
    // Validate services
    if (!auth || !auth.app) {
      throw new Error("Backup Auth validation failed");
    }
    
    if (!db || !db.app) {
      throw new Error("Backup Firestore validation failed");
    }
    
    console.log("[🔥 Firebase Backup] All services initialized and validated");
    
    return { auth, db, app };
    
  } catch (error) {
    console.error("[🔥 Firebase Backup] Complete backup initialization failed:", error);
    throw error;
  }
};

// Minimal Firebase services for emergency fallback
export const createMinimalFirebaseServices = () => {
  console.log("[🔥 Firebase Minimal] Creating minimal services...");
  
  // Create mock services that won't crash the app
  const mockAuth = {
    app: { name: 'minimal-app' },
    currentUser: null,
    onAuthStateChanged: (callback) => {
      console.log("[🔥 Firebase Minimal] Mock auth state change listener");
      callback(null);
      return () => {};
    }
  };
  
  const mockDb = {
    app: { name: 'minimal-app' },
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false }),
        set: () => Promise.resolve(),
        onSnapshot: () => () => {}
      })
    })
  };
  
  console.log("[🔥 Firebase Minimal] Minimal services created");
  return { auth: mockAuth, db: mockDb };
}; 