# 🛠️ USB-Free iOS Debugging Guide

This guide explains how to debug iOS crashes without needing USB cables or Xcode, using the implemented on-screen logging system.

## 🔧 Step 1: On-Screen Debug Logs (IMPLEMENTED)

### Features
- **Visual Logs**: All console.log, console.error, and console.warn messages appear on screen
- **Real-time Updates**: Logs update in real-time as your app runs
- **Color Coding**: 
  - 🟢 Green: Info/Log messages
  - 🟡 Yellow: Warning messages  
  - 🔴 Red: Error messages
- **Auto-scroll**: Automatically scrolls to latest logs
- **Persistent Toggle**: Debug overlay can be toggled on/off

### How to Use
1. **Enable Debug Mode**: Set `DEBUG_MODE = true` in `App.js` (already enabled)
2. **Toggle Debug View**: Tap the orange "🔧 DEBUG" button in the top-right corner
3. **View Logs**: Scroll through logs to see exactly where your app stops
4. **Controls**:
   - ❌ Close Debug: Hide the debug overlay
   - ⏸️ Pause / ▶️ Auto: Toggle auto-scrolling
   - 🗑️ Clear: Clear all logs

### What You'll See
```
[10:30:15] LOG: [INIT] 🚀 App.tsx mounted - Starting diagnostic logging
[10:30:15] LOG: [INIT] 📱 Platform: ios
[10:30:15] LOG: [INIT] 🔧 Environment: Development
[10:30:16] LOG: [FIREBASE] 🏗️ Firebase module loaded - Starting initialization
[10:30:16] ERROR: [FIREBASE] 🔥 Firebase initialization failed: Network error
```

### Key Debugging Points
The system automatically logs:
- ✅ App initialization steps
- ✅ Firebase service initialization
- ✅ Navigation mounting
- ✅ Auth state changes
- ✅ Component mounting/unmounting
- ✅ Error boundaries activation
- ✅ Critical errors with stack traces

## 🌐 Step 2: Remote Logging (IMPLEMENTED)

### Setup Remote Logging
1. **Enable Remote Logging** in `App.js`:
   ```javascript
   // Uncomment these lines in App.js:
   remoteLogger.setEnabled(true);
   remoteLogger.setEndpoint('https://your-webhook-url.com/log');
   ```

2. **Choose Your Endpoint**:

   **Option A: Simple Webhook (Recommended)**
   ```javascript
   // Use Zapier/Make.com to create a webhook that saves to Google Sheets
   remoteLogger.setEndpoint('https://hooks.zapier.com/hooks/catch/YOUR_ID/YOUR_HOOK/');
   ```

   **Option B: Firebase Cloud Function**
   ```javascript
   remoteLogger.setEndpoint('https://your-region-your-project.cloudfunctions.net/logReceiver');
   ```

   **Option C: Simple Server**
   ```javascript
   // Deploy a simple Express server to Heroku/Railway
   remoteLogger.setEndpoint('https://your-app.herokuapp.com/log');
   ```

### What Gets Sent
```json
{
  "logs": [
    {
      "timestamp": "2024-01-15T10:30:15.123Z",
      "level": "ERROR",
      "message": "Firebase initialization failed: Network error",
      "platform": "ios",
      "metadata": {
        "deviceInfo": {
          "platform": "ios",
          "version": "17.0"
        }
      }
    }
  ],
  "appVersion": "1.0.0",
  "sessionId": 1642234215123
}
```

### Manual Remote Logging
```javascript
import { logRemote } from './services/RemoteLogService';

// In your components:
logRemote.critical('App crashed during startup', error);
logRemote.lifecycle('SCREEN_MOUNTED', { screen: 'HomeScreen' });
logRemote.performance('SCREEN_LOAD_TIME', 1200, 'ms');
```

## 🔥 Step 3: Expo Dev Client (SETUP REQUIRED)

### Install Dev Client
```bash
npx expo install expo-dev-client
```

### Update EAS Configuration
Your `eas.json` should include:
```json
{
  "preview": {
    "distribution": "internal",
    "developmentClient": true,
    "ios": {
      "buildConfiguration": "Debug",
      "simulator": true
    }
  }
}
```

### Build and Install
```bash
# Build dev client
eas build --profile preview --platform ios

# Install via TestFlight or direct download
# You'll get better error reporting and live reloading
```

## 🔍 Debugging Workflow

### 1. Identify the Problem
- Launch your app and tap "🔧 DEBUG" button
- Watch the logs in real-time
- Note the last successful log before the crash

### 2. Common Patterns
- **Firebase Issues**: Look for `[FIREBASE]` logs showing initialization failures
- **Navigation Issues**: Check `[NAV]` logs for routing problems  
- **Auth Issues**: Monitor `[PROVIDER]` logs for authentication state
- **Component Issues**: Watch for `[INIT]` logs stopping at specific components

### 3. Add More Logging
Add strategic logging in your components:
```javascript
console.log('[MY_COMPONENT] 🚀 Component mounting');
console.log('[MY_COMPONENT] 📊 Props received:', props);
console.log('[MY_COMPONENT] 🎯 About to call API');
```

### 4. Remote Tracking
For persistent crashes:
```javascript
logRemote.critical('Consistent crash at component X', error);
```

## 🚨 Emergency Debugging Mode

If your app crashes immediately, you can enable **Emergency Debug Mode**:

1. Set `DEBUG_MODE = true` and `showDebugLogs = true` in `App.js`
2. Comment out problematic imports one by one
3. Use the minimal error boundaries to isolate issues

## 📱 Testing on Device

### Without USB:
1. Build with `eas build --profile preview --platform ios`
2. Install via TestFlight or Ad Hoc distribution
3. Use on-screen logs to debug
4. Optionally enable remote logging for persistent tracking

### With Network Debugging:
1. Ensure device and computer are on same network
2. Enable remote logging
3. Use network debugging tools to monitor requests

## 🔧 Advanced Debugging

### Custom Log Categories
```javascript
// Add to App.js debug system
console.log('[CUSTOM_CATEGORY] Your message here');
```

### Performance Monitoring
```javascript
const startTime = Date.now();
// ... your code ...
const endTime = Date.now();
logRemote.performance('OPERATION_TIME', endTime - startTime);
```

### Memory Monitoring
```javascript
// Add memory usage logging
const memoryUsage = performance.memory?.usedJSHeapSize || 'N/A';
console.log('[MEMORY] 📊 Heap usage:', memoryUsage);
```

## 📋 Troubleshooting Checklist

- [ ] DEBUG_MODE is set to true
- [ ] On-screen logs are visible
- [ ] Last successful log identified
- [ ] Firebase initialization logs checked
- [ ] Navigation mounting logs verified
- [ ] Auth state change logs monitored
- [ ] Component mounting sequence traced
- [ ] Error boundaries activation checked
- [ ] Remote logging enabled (if needed)
- [ ] Network connectivity verified (for remote logs)

## 🎯 Next Steps

1. **Immediate**: Use on-screen logs to identify crash point
2. **Short-term**: Set up remote logging for persistent tracking
3. **Long-term**: Implement expo-dev-client for enhanced debugging

Remember: The goal is to see exactly where your app stops working, then add more targeted logging around that area to identify the root cause. 