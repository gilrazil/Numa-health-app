# ✅ Alpha Testing Checklist - Before Sending to Testers

## 🔧 Developer Pre-Flight Check

### **Step 1: Verify Expo Server**
- [ ] **Terminal shows QR code** (no bundling errors)
- [ ] **"Metro waiting on exp://..." message** appears
- [ ] **No red error messages** in terminal

### **Step 2: Test on Your Own Device**
- [ ] **Download Expo Go** on your iPhone
- [ ] **Scan QR code** from terminal
- [ ] **App loads** without crashes
- [ ] **Welcome screen** appears

### **Step 3: Test Core MVP Features**
- [ ] **User Registration**: Can create new account
- [ ] **Onboarding Flow**: Complete gender, age, height, weight, goal
- [ ] **Camera Access**: Camera opens when tapping "Start Tracking"
- [ ] **Take Photo**: Can capture meal photo
- [ ] **AI Analysis**: Analysis screen loads (may show demo mode)
- [ ] **Hebrew Interface**: All text displays correctly

### **Step 4: Test Edge Cases**
- [ ] **Camera Permissions**: App requests camera access
- [ ] **Photo Gallery**: Can select from gallery
- [ ] **Network Issues**: App handles poor connection gracefully
- [ ] **App Switching**: Can minimize/restore app

---

## 📱 Ready to Send to Alpha Testers

### **When All Above ✅ Checked:**

#### **1. Take QR Code Screenshot**
- Screenshot the QR code from your terminal
- Make sure it's clear and scannable

#### **2. Prepare Tester Message**
Use the template from `TESTER_MESSAGE_TEMPLATE.md`:
```
🚀 Test my new meal tracking app!

1. Download "Expo Go" from App Store
2. Scan this QR code: [ATTACH QR CODE]
3. Test the camera + AI meal analysis
4. Report any bugs to me

Focus on testing the camera - that's the main feature!
```

#### **3. Send to 2-3 Testers First**
- Start with close friends/family
- Ask them to focus on **camera functionality**
- Request feedback within 24 hours

#### **4. Monitor and Support**
- Watch for bug reports
- Respond quickly to issues
- Keep terminal/server running

---

## 🎯 Success Criteria

### **Alpha Testing is Successful When:**
- [ ] **90%+ testers** can load the app
- [ ] **Camera works** on different iPhone models
- [ ] **Photo capture** works reliably
- [ ] **AI analysis** provides results (demo or real)
- [ ] **No critical crashes** reported
- [ ] **Hebrew text** displays correctly

### **Ready for More Testers When:**
- [ ] **Major bugs fixed** from first 2-3 testers
- [ ] **Camera functionality** proven stable
- [ ] **User flow** works smoothly
- [ ] **Positive feedback** from initial testers

---

## 🚨 Common Issues to Watch For

### **If Testers Report:**
1. **"App won't load"** → Check QR code, restart server
2. **"Camera not working"** → Permissions issue, guide them to Settings
3. **"Analysis not working"** → Expected (demo mode), explain it's normal
4. **"Hebrew text weird"** → Font/encoding issue, needs investigation
5. **"App crashes"** → Critical bug, investigate immediately

---

## 📞 Support Template for Testers

**Copy-paste response for common issues:**

```
Thanks for testing! Here are solutions for common issues:

🔄 App won't load: Update Expo Go app, re-scan QR code
📸 Camera not working: Go to Settings > Numa > Allow Camera
🤖 Analysis shows "demo mode": Normal for now, still test the flow
📱 App crashes: Please send me your iPhone model + iOS version

Let me know if issues persist!
```

---

**Ready to launch alpha testing! 🚀📱**

*Remember: The goal is to validate that camera + meal analysis works on real devices with real users.* 