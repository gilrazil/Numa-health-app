# 📱 Numa Health App - Alpha Testing Guide

## 🎯 Goal: Mobile Testing with Camera Functionality

Your alpha testers need to test the full mobile experience, especially the camera feature for meal tracking. Here are the available options while your Apple Developer account is pending.

## 🚀 Testing Options (Ranked by Recommendation)

### Option 1: **Expo Go + Development Build** (Available Now)
**Best for**: Immediate testing, no Apple Developer account needed

#### For You (Developer):
1. **Create Development Build**:
   ```bash
   # Skip Apple login for now
   npx eas-cli build --platform ios --profile development --no-wait
   ```

2. **Share via QR Code**:
   - Once build completes, you'll get a QR code
   - Testers scan with Expo Go app

#### For Alpha Testers:
1. **Install Expo Go**: Download from App Store
2. **Scan QR Code**: You provide from EAS build
3. **Test Full App**: Including camera functionality

**Pros**: ✅ Works immediately, ✅ Full camera access, ✅ Real device testing
**Cons**: ⚠️ Requires Expo Go app, ⚠️ Some limitations vs native build

---

### Option 2: **TestFlight** (After Apple Approval)
**Best for**: Production-like testing experience

#### Setup (Once Apple Developer approved):
```bash
npx eas-cli build --platform ios --profile testflight
```

#### For Alpha Testers:
1. **Receive TestFlight Invite**: Via email
2. **Install TestFlight**: From App Store
3. **Install Numa App**: Through TestFlight
4. **Test Full Experience**: Native app experience

**Pros**: ✅ Native app experience, ✅ Easy distribution, ✅ Crash reporting
**Cons**: ❌ Requires Apple Developer account

---

### Option 3: **Ad-Hoc Distribution** (Alternative)
**Best for**: Small group of specific testers

#### Requirements:
- Apple Developer account
- Device UDIDs from testers
- Manual installation process

---

## 🔧 Immediate Action Plan

### Step 1: Prepare Development Build
Let's modify the EAS configuration to work without Apple Developer credentials:

```json
// eas.json - development profile
"development": {
  "developmentClient": true,
  "distribution": "internal",
  "ios": {
    "simulator": false,
    "bundleIdentifier": "com.numahealth.app.dev"
  }
}
```

### Step 2: Create Alpha Tester Instructions

#### For Testers:
1. **Install Expo Go** from App Store
2. **Join Testing Group** (WhatsApp/Telegram/Email)
3. **Scan QR Code** when provided
4. **Test Key Features**:
   - Sign up / Login
   - Complete onboarding
   - Take meal photos
   - View analysis results
   - Check recent meals

### Step 3: Feedback Collection
- **Bug Reports**: Use GitHub Issues or simple form
- **Feature Feedback**: Structured questionnaire
- **Usage Analytics**: Firebase Analytics (already integrated)

## 📋 Testing Checklist for Alpha Testers

### Core Functionality:
- [ ] App launches successfully
- [ ] User registration works
- [ ] Login/logout functions
- [ ] Onboarding flow completes
- [ ] Profile data saves correctly

### Camera & Meal Tracking (MVP Features):
- [ ] Camera opens and works
- [ ] Can take meal photos
- [ ] Photos upload to Firebase
- [ ] AI analysis generates results
- [ ] Analysis displays correctly in Hebrew
- [ ] Recent meals show thumbnails
- [ ] Can view previous meal analysis

### Edge Cases:
- [ ] Works on different iOS versions
- [ ] Handles poor network connection
- [ ] Camera permissions work correctly
- [ ] App doesn't crash during photo upload
- [ ] OpenAI API errors handled gracefully

## 🛠️ Development Build Setup

Since your Apple Developer account is pending, let's create a build that works with Expo Go:

### Modified EAS Configuration:
```json
{
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "channel": "development"
  }
}
```

### Environment Variables for Testing:
Make sure these are set in EAS:
- `API_KEY`: Your Firebase API key
- `PROJECT_ID`: numa-app-34ede
- `OPENAI_API_KEY`: Your OpenAI key
- All other Firebase config variables

## 📱 Alternative: Expo Development Client

If Expo Go has limitations, we can create a custom development client:

```bash
# Create custom development client
npx create-expo-app --template blank-typescript
npx expo install expo-dev-client
npx eas-cli build --profile development --platform ios
```

## 🎯 Next Steps

1. **Immediate**: Set up development build for Expo Go
2. **Short-term**: Prepare TestFlight once Apple approves
3. **Long-term**: Production release

## 📞 Support for Alpha Testers

### Common Issues & Solutions:

1. **"App won't load"**:
   - Check internet connection
   - Update Expo Go app
   - Re-scan QR code

2. **"Camera not working"**:
   - Check camera permissions in Settings
   - Restart app
   - Try different lighting

3. **"Analysis not working"**:
   - Check network connection
   - May be using demo mode (orange banner)
   - Try again in a few minutes

### Contact Information:
- **Developer**: [Your contact info]
- **Bug Reports**: [GitHub/Email]
- **Urgent Issues**: [Phone/WhatsApp]

---

**Ready to start alpha testing! 🚀** 