# Numa Health App 🏥

![Supports Expo iOS](https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff)
![Supports Expo Android](https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff)
[![runs with Expo Go](https://img.shields.io/badge/Runs%20with%20Expo%20Go-4630EB.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000)](https://expo.dev/client)

A comprehensive health and nutrition tracking app built with Expo and Firebase, featuring advanced AI-powered meal analysis in Hebrew.

## Features

### 🔐 **Authentication & Onboarding**
- Email/password authentication with Firebase
- Biometric authentication (Face ID/Touch ID)
- Complete user onboarding flow:
  - Gender selection
  - Age, height, weight input
  - Health goal setting (reduce/maintain/increase weight)
  - Profile creation

### 📸 **Meal Analysis**
- Camera integration for meal photography
- Gallery image selection
- **4-Step AI-Powered Analysis (Hebrew Interface):**
  1. 🥇 **Ingredient Identification** - Using OpenAI Vision API
  2. 🥈 **Nutritional Calculation** - Calories, protein, carbs, fat, fiber
  3. 🥉 **Goal Alignment Scoring** - Personalized 1-100 scoring based on user profile
  4. 🏅 **Improvement Tips** - AI-generated recommendations in Hebrew

### ✏️ **Advanced Text Editing**
- Natural language ingredient editing in Hebrew
- Commands like "הוסף 100 גרם אורז" (Add 100g rice)
- Real-time ingredient list modification
- GPT-4 powered command parsing

### 📊 **User Profile & Tracking**
- Personal health metrics dashboard
- Meal history with Firebase storage
- Goal progress tracking
- Offline/online state handling

## Technology Stack

- **Frontend:** React Native with Expo SDK 53
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **AI:** OpenAI GPT-4 Vision + GPT-4 for meal analysis
- **Navigation:** React Navigation 6
- **Language:** Hebrew interface for meal analysis features
- **Authentication:** Firebase Auth + Expo Local Authentication

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd numa-health-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Rename `example.env` to `.env`
   - Add your Firebase configuration:
```env
API_KEY=your_firebase_api_key
AUTH_DOMAIN=your_project.firebaseapp.com
PROJECT_ID=your_project_id
STORAGE_BUCKET=your_project.appspot.com
MESSAGING_SENDER_ID=your_sender_id
APP_ID=your_app_id
```

4. Set up OpenAI API:
   - Create `config/openai.js` with your API key:
```javascript
export const OPENAI_CONFIG = {
  apiKey: 'your_openai_api_key_here'
};
```

## Running the App

Start the development server:
```bash
npx expo start
```

For device testing:
```bash
# iOS
npx expo start --ios

# Android  
npx expo start --android
```

## File Structure

```
Numa Health App/
├── assets/                    # App icons and images
├── components/               # Reusable UI components
├── config/                   # Configuration files
│   ├── firebase.js          # Firebase configuration
│   ├── openai.js            # OpenAI API configuration
│   └── theme.js             # App theme and colors
├── hooks/                    # Custom React hooks
├── navigation/               # Navigation configuration
├── providers/                # Context providers
├── screens/                  # App screens
│   ├── WelcomeScreen.js     # App introduction
│   ├── GenderScreen.js      # Gender selection
│   ├── AgeHeightWeightScreen.js # Personal metrics
│   ├── GoalScreen.js        # Health goals
│   ├── SignupScreen.js      # Account creation
│   ├── LoginScreen.js       # User login
│   ├── HomeScreen.js        # Main dashboard
│   ├── MealCameraScreen.js  # Photo capture
│   └── MealAnalysisScreen.js # AI analysis results
├── services/                 # Business logic services
│   ├── MealAnalysisService.js # AI meal analysis
│   └── TextEditingService.js  # Hebrew text editing
└── utils/                    # Utility functions
```

## Key Screens

### **Onboarding Flow**
1. **Welcome** - App introduction
2. **Gender Selection** - Male/Female/Other
3. **Personal Metrics** - Age, height, weight input
4. **Goal Setting** - Health objectives
5. **Account Creation** - Email/password signup

### **Main App**
- **Home Dashboard** - User profile and meal history
- **Meal Camera** - Photo capture with gallery access
- **Meal Analysis** - Comprehensive AI analysis in Hebrew

## AI Analysis Features

The app provides sophisticated meal analysis through OpenAI integration:

### 🧠 **Ingredient Recognition**
- Advanced computer vision using GPT-4 Vision
- Quantity estimation with confidence scoring
- Hebrew ingredient names and descriptions

### 📊 **Nutritional Analysis**
- Comprehensive macro and micronutrient calculation
- Calorie counting with portion accuracy
- Fiber and other nutrient tracking

### 🎯 **Goal Alignment**
- Personalized scoring based on user profile
- Weight goal consideration (lose/maintain/gain)
- Health objective alignment assessment

### 💡 **Smart Recommendations**
- AI-generated improvement suggestions
- Hebrew language tips and advice
- Contextual meal optimization guidance

## User Profile Example

The app supports users like:
- **Age:** 57, **Height:** 178cm, **Weight:** 91kg
- **Gender:** Male
- **Goal:** Reduce weight
- **Email:** gil.raz.il@gmail.com

## Development Status

The app is in active development with:
- ✅ Complete onboarding flow
- ✅ Firebase authentication and data storage
- ✅ Camera integration and image handling
- ✅ Advanced AI meal analysis (4-step process)
- ✅ Hebrew interface for analysis features
- ✅ Text editing with natural language commands
- ✅ Biometric authentication setup
- ✅ User profile management

## Requirements

- Node.js 16+
- Expo CLI
- iOS Simulator or Android Emulator
- Firebase project setup
- OpenAI API key

## 🚨 **Build 28 - Critical Navigation Note**

**Build 28 intentionally bypasses the normal navigation structure (RootNavigator/AppStack) to ensure ONLY Firestore operations are tested.**

- ✅ **Uses**: `Build28FirestoreTestNavigator` (Firestore-only testing)
- ❌ **Does NOT use**: `RootNavigator/AppStack` (contains camera functionality)
- 🎯 **Objective**: Validate Firestore operations before adding camera complexity in Build 29

This is a temporary navigation structure for systematic testing purposes.

---

**Built for comprehensive health tracking with AI-powered insights** 🏥
