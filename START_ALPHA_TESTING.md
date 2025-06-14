# 🚀 Start Alpha Testing - Step by Step Guide

## For You (Gil) - Developer Steps

### Step 1: Start the Development Server
1. **Open Terminal** in your project folder
2. **Run this command**:
   ```bash
   npx expo start --tunnel --clear
   ```
3. **Wait for it to load** - you'll see:
   - Metro bundler starting
   - QR code appearing
   - Tunnel URL being generated

### Step 2: Get the QR Code
Once Expo starts, you'll see something like this in your terminal:
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

**The QR code will be displayed in your terminal!**

### Step 3: Share with Alpha Testers
1. **Take a screenshot** of the QR code from your terminal
2. **Send to testers** along with the setup instructions
3. **Or share the exp:// URL** that appears in the terminal

---

## For Alpha Testers - Simple Instructions

### What They Need to Do:
1. **Download Expo Go** from App Store
2. **Scan your QR code** with Expo Go app
3. **Test the app** on their phone

### What They'll Test:
- ✅ **Camera functionality** (main feature)
- ✅ **Take meal photos**
- ✅ **AI analysis in Hebrew**
- ✅ **User registration/login**
- ✅ **Complete onboarding**

---

## 🔧 Troubleshooting

### If Expo Won't Start:
1. **Kill existing processes**:
   ```bash
   pkill -f "expo start"
   ```
2. **Try again**:
   ```bash
   npx expo start --tunnel --clear
   ```

### If No QR Code Appears:
1. **Check your terminal** - scroll up to see the QR code
2. **Try without tunnel**:
   ```bash
   npx expo start --clear
   ```
3. **Use Expo Dashboard**: Go to https://expo.dev and find your project

### If Testers Can't Connect:
1. **Make sure they have Expo Go** installed
2. **Check they're scanning the right QR code**
3. **Try sharing the exp:// URL** instead

---

## 📱 What Happens Next

### When Testers Scan QR Code:
1. **Expo Go opens** your app
2. **App loads** on their phone
3. **They can test** all features including camera
4. **Updates automatically** when you make changes

### When You Make Changes:
1. **Save your code** changes
2. **Expo automatically reloads** the app for testers
3. **No need to restart** the server

---

## 🎯 Success Indicators

### You'll Know It's Working When:
- ✅ **QR code appears** in terminal
- ✅ **Testers can scan** and load the app
- ✅ **Camera works** on their phones
- ✅ **They can take meal photos**
- ✅ **AI analysis works**

---

## 📞 Next Steps

1. **Start the server** (Step 1 above)
2. **Get the QR code** (Step 2 above)
3. **Send to 2-3 testers** first
4. **Ask them to test camera** functionality
5. **Collect feedback** via WhatsApp/email

---

**Ready to start! The camera functionality is your MVP - focus on that! 📸** 