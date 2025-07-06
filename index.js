// Build 43 - Upload + Firestore Logging
console.log('=== INDEX.JS LOADED - BUILD 43 UPLOAD + FIRESTORE LOGGING ===');

import { AppRegistry } from 'react-native';
import App from './App';

console.log('=== APP IMPORTS LOADED ===');
console.log('App component loaded:', !!App);

console.log('=== REGISTERING ROOT COMPONENT ===');

// Try to send a simple fetch request to verify network
try {
  fetch('https://webhook.site/0c8c4a7e-33bb-4ea7-a5b6-0129f69d57a0', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        event: 'index.js loaded - Build 43 - Upload + Firestore Logging',
  timestamp: new Date().toISOString(),
  platform: 'ios',
  buildNumber: '43'
    })
  }).catch(() => {});
} catch (e) {}

console.log('=== BEFORE REGISTER ROOT ===');

AppRegistry.registerRootComponent(App);

console.log('=== APP REGISTERED SUCCESSFULLY ==='); 