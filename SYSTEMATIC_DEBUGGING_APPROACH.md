# 🔍 SYSTEMATIC DEBUGGING APPROACH

## 📋 **CORE PRINCIPLE**
**ALWAYS perform comprehensive audits BEFORE making fixes. Fix ALL related issues in one commit, then build/test once.**

## 🚫 **ANTI-PATTERN (Don't Do This)**
- Fix one location → Test → Fails
- Fix another location → Test → Fails  
- Fix third location → Test → Finally works
- **Result:** Multiple failed attempts, user frustration

## ✅ **SYSTEMATIC APPROACH (Do This)**
1. **MAP ALL** possible root causes
2. **AUDIT ALL** related files/configurations
3. **FIX ALL** discrepancies in one commit
4. **TEST ONCE** with confidence
5. **Result:** Single successful attempt, user satisfaction

## 📋 **SPECIFIC CHECKLISTS**

### **🔢 Build Number/Version Issues**
Always check ALL locations:
- [ ] `app.config.js` (buildNumber)
- [ ] `iOS project.pbxproj` (CURRENT_PROJECT_VERSION)  
- [ ] `iOS Info.plist` (CFBundleVersion)
- [ ] `package.json` (version)
- [ ] `eas.json` (appVersionSource)
- [ ] Any other config files

### **🔥 Crash/Runtime Issues**
Always check ALL potential causes:
- [ ] Dependencies compatibility
- [ ] Configuration conflicts
- [ ] Platform-specific settings
- [ ] Cache/build issues
- [ ] Code syntax/logic errors
- [ ] Environment variables

### **🏗️ Build/Deploy Issues**
Always check ALL build pipeline:
- [ ] Configuration files
- [ ] Environment settings
- [ ] Dependencies versions
- [ ] Platform requirements
- [ ] Cache states
- [ ] Credentials/keys

### **🔗 Integration Issues**
Always check ALL integration points:
- [ ] API endpoints/keys
- [ ] Service configurations
- [ ] Platform-specific setup
- [ ] Dependencies versions
- [ ] Network/security settings

## 🎯 **EXECUTION STEPS**

1. **PAUSE** - Don't rush to fix the first thing you see
2. **ANALYZE** - Map out all possible root causes
3. **AUDIT** - Check ALL related files/configurations
4. **DOCUMENT** - List all discrepancies found
5. **FIX ALL** - Address everything in one commit
6. **VERIFY** - Double-check all fixes before testing
7. **TEST ONCE** - Build/deploy with confidence

## 📝 **COMMUNICATION PROTOCOL**

### **Before Starting:**
- "I'll perform a comprehensive audit of all [specific area] configurations"
- "Let me check all possible locations where [issue] could originate"

### **During Audit:**
- Document findings: "Found discrepancy in X, Y, Z"
- Show comprehensive fix plan before implementing

### **After Fixing:**
- "All [X] locations now synchronized"
- "Ready for single build/test with confidence"

## 🔄 **CONTINUOUS IMPROVEMENT**
- Update this document when new issue patterns emerge
- Add new checklists for different problem types
- Refine approach based on lessons learned

## 💡 **REMEMBER**
**Time invested in comprehensive analysis upfront saves multiple failed attempts and user frustration later.**

---
*This approach ensures consistent, systematic debugging across all project activities.* 