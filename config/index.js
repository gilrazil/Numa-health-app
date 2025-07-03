// For development simplicity, just export Firebase components
export { auth, db, storage } from "./firebase";
export { default as firebase } from "./firebase";

// Export firebaseConfig for App.js
export const firebaseConfig = {
  apiKey: "AIzaSyBwdZ-r61PbfPEE1UVQfTvAQMrBQhQGvC8",
  authDomain: "numa-app-34ede.firebaseapp.com",
  projectId: "numa-app-34ede",
  storageBucket: "numa-app-34ede.firebasestorage.app",
  messagingSenderId: "859592733394",
  appId: "1:859592733394:web:3cfc8ebd8e7a99b82fb30b"
};

// Theme and images exports
export const Colors = {
  orange: '#007AFF',
  white: '#FFFFFF',
  black: '#000000',
  mediumGray: '#666666',
  lightGray: '#F5F5F5'
};

export const Images = {
  logo: require("../assets/numa-logo.png"),
};
