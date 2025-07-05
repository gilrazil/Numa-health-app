// Build 40 - Timestamp Metadata Validation
console.log('=== INDEX.JS LOADED - BUILD 40 TIMESTAMP METADATA VALIDATION ===');

import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

// Log before importing App
console.log('=== BEFORE APP IMPORT ===');

import App from './App';

// Log after importing App
console.log('=== AFTER APP IMPORT ===');

// Try to send a simple fetch request to verify network
try {
  fetch('https://webhook.site/0c8c4a7e-33bb-4ea7-a5b6-0129f69d57a0', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        event: 'index.js loaded - Build 40 - Timestamp Metadata Validation',
  timestamp: new Date().toISOString(),
  platform: 'ios',
  buildNumber: '38'
    })
  }).catch(() => {});
} catch (e) {}

console.log('=== BEFORE REGISTER ROOT ===');

registerRootComponent(App);

console.log('=== AFTER REGISTER ROOT ==='); 