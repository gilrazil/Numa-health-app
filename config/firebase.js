// Firebase v9 configuration with Expo SDK 53 compatibility
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBwdZ-r61PbfPEE1UVQfTvAQMrBQhQGvC8",
  authDomain: "numa-app-34ede.firebaseapp.com",
  projectId: "numa-app-34ede",
  storageBucket: "numa-app-34ede.firebasestorage.app",
  messagingSenderId: "859592733394",
  appId: "1:859592733394:web:3cfc8ebd8e7a99b82fb30b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services - Metro config fixes the CJS module loading issue
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

