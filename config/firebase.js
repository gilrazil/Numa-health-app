// config/firebase.js

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase only once
let app;
let auth;
let db;
let storage;

if (firebase.apps.length === 0) {
  // Initialize Firebase app
  app = firebase.initializeApp(firebaseConfig);
  
  // Get services
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
  
  // Configure Firestore settings
  try {
    db.settings({
      experimentalForceLongPolling: true, // Helps with connection issues
      merge: true,
    });
  } catch (error) {
    console.log("Firestore settings error (can be ignored):", error.message);
  }
  
  // Configure auth persistence for better reliability
  try {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  } catch (error) {
    console.log("Auth persistence error (can be ignored):", error.message);
  }
  
  console.log("Firebase initialized successfully");
} else {
  // Use existing app
  app = firebase.app();
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
}

export { auth, db, storage };
export default firebase;

