// Build 35 - Camera File Output Validation
console.log('=== INDEX.JS LOADED - BUILD 35 CAMERA FILE OUTPUT TEST ===');

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
        event: 'index.js loaded - Build 35 - Camera File Output Test',
  timestamp: new Date().toISOString(),
  platform: 'ios',
  buildNumber: '35'
    })
  }).catch(() => {});
} catch (e) {}

console.log('=== BEFORE REGISTER ROOT ===');

registerRootComponent(App);

console.log('=== AFTER REGISTER ROOT ==='); 