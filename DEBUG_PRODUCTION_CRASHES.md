# 🔍 Debug Production Crashes Guide

## Quick Setup (5 minutes)

### 1. Get a free webhook URL:
1. Go to https://webhook.site
2. Copy your unique URL (looks like: `https://webhook.site/abc123...`)

### 2. Enable remote logging:
```javascript
// In services/RemoteLogService.js
this.isEnabled = true;
this.remoteEndpoint = 'https://webhook.site/YOUR-UNIQUE-ID';
```

### 3. Build for TestFlight:
```bash
# Increment build number in app.config.js first!
eas build --platform ios --profile testflight
```

### 4. Monitor crashes in real-time:
- Keep webhook.site open in your browser
- Install TestFlight build
- Watch logs appear as the app runs
- **The last log before crash = your culprit**

## What we're tracking:
1. **App startup**: `[App.js loaded]`
2. **Firebase init**: `[Firebase initialization]`
3. **Camera access**: `[CAMERA] ImagePicker module`
4. **Critical errors**: Auto-sent with stack traces

## Common crash patterns:

### Camera/ImagePicker crash:
```
[CAMERA] ImagePicker module is null/undefined!
```
**Fix**: The camera module isn't properly linked in the production build

### Firebase crash:
```
[FIREBASE] Firebase initialization failed
```
**Fix**: Check Firebase config matches your project

### Memory crash:
```
[CAMERA] Safe initialization error: Out of memory
```
**Fix**: Image quality too high, reduce to 0.7 or lower

## Next steps after finding crash:
1. Note the last successful log
2. Check the error message
3. Search codebase for that specific area
4. Apply targeted fix (not broad "maybe this helps" fixes)

## Pro tip:
Add more logging around the crash point:
```javascript
logRemote.info('About to call risky function');
riskyFunction();
logRemote.info('Risky function completed'); // Won't see this if it crashes
``` 