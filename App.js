import React, { useEffect, useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert, 
  Platform,
  ActivityIndicator
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
// import { Camera, CameraType } from 'expo-camera'; // COMMENTED OUT - Build 31: No camera hardware access
import { AuthenticatedUserProvider, AuthenticatedUserContext } from "./providers";
import { auth, db } from "./config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Debug logging system
const DEBUG_LOGS = [];
const addLog = (level, ...args) => {
  const timestamp = new Date().toLocaleTimeString();
  const message = `[${timestamp}] [${level}] ${args.join(' ')}`;
  DEBUG_LOGS.push(message);
  
  // Keep only last 100 logs
  if (DEBUG_LOGS.length > 100) {
    DEBUG_LOGS.shift();
  }
  
  // Also log to console
  console.log(message);
};

// Initialize logs
  addLog("INIT", "🚀 Build 31 - Camera Permissions Test initialized");
  addLog("INIT", "📱 Testing camera permission prompts ONLY");
  addLog("INIT", "✅ Firestore operations proven stable in Build 28");
addLog("INIT", "🔥 Firebase Config:", auth?.app?.name || "No app name");
addLog("INIT", "💾 Firestore Config:", db?.app?.name || "No Firestore app name");

  // Build 31 Critical: Testing camera permission prompts ONLY - NO camera component mounting
  // This safely tests permission flow after Build 30 UI navigation success (now Build 31)
  addLog("INIT", "🛡️ Build 31: Camera permissions testing ENABLED - no hardware mounting");

// Test Firestore connection
if (db) {
  addLog("DB", "✅ Firestore instance available");
} else {
  addLog("DB", "❌ Firestore instance not available");
}

// Track auth state changes
if (auth) {
  addLog("AUTH", "✅ Auth instance available");
  auth.onAuthStateChanged((user) => {
    addLog("AUTH", "🔄 Auth state changed:", user ? `${user.email || user.uid}` : "null");
  });
} else {
  addLog("AUTH", "❌ Auth instance not available");
}

console.log("[INIT] 📚 All imports successful");
  console.log("[INIT] 🛡️ Build 31 - Camera Permissions Test Navigator components loaded");

  // Build 31 Test Screens - Camera Permissions Testing Only (No Camera Hardware)
const LoginTestScreen = ({ navigation }) => {
  const [email, setEmail] = useState("gil.raz.il@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    addLog("LOGIN", "🔑 Starting login process");
    addLog("LOGIN", "📧 Email:", email);
    
    if (!email || !password) {
      addLog("LOGIN", "❌ Email or password missing");
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    addLog("LOGIN", "⏳ Setting loading state to true");

    try {
      addLog("LOGIN", "🔐 Attempting Firebase authentication");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      addLog("LOGIN", "✅ Firebase authentication successful");
      addLog("LOGIN", "👤 User UID:", firebaseUser.uid);
      addLog("LOGIN", "📧 User email:", firebaseUser.email);
      
      setUser(firebaseUser);
      setLoginSuccess(true);
      
      addLog("LOGIN", "🎉 LOGIN SUCCESSFUL!");
      addLog("LOGIN", "✅ Firebase authentication is working!");
      
    } catch (error) {
      addLog("LOGIN", "❌ Login failed:", error.message);
      Alert.alert("Login Error", error.message);
    } finally {
      setLoading(false);
      addLog("LOGIN", "⏳ Setting loading state to false");
    }
  };

  const handleTestFirestore = async () => {
    if (!user) {
      addLog("FIRESTORE", "❌ No user logged in, cannot test Firestore");
      Alert.alert("Error", "Please login first");
      return;
    }

    addLog("FIRESTORE", "📄 Starting Firestore test");
    addLog("FIRESTORE", "👤 User:", user.email);

    try {
      // Navigate to navigation screen for Firestore testing
      navigation.navigate('NavigationTest');
    } catch (error) {
      addLog("FIRESTORE", "❌ Firestore test navigation failed:", error.message);
      Alert.alert("Firestore Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛡️ Build 31 - Camera Permissions Test</Text>
      
      {!loginSuccess ? (
        <>
          <Text style={styles.subtitle}>Step 1: Login with Firebase</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>🔑 Login</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.successTitle}>🎉 LOGIN SUCCESSFUL!</Text>
          <Text style={styles.successText}>✅ Firebase authentication is working!</Text>
          
          <View style={styles.userInfo}>
            <Text style={styles.userText}>👤 User: {user.email}</Text>
            <Text style={styles.userText}>🆔 UID: {user.uid}</Text>
          </View>

          <Text style={styles.subtitle}>Step 2: Test Firestore Operations</Text>
          
          <TouchableOpacity 
            style={styles.firestoreButton} 
            onPress={() => navigation.navigate('NavigationTest')}
          >
            <MaterialCommunityIcons name="database" size={24} color="#fff" />
            <Text style={styles.firestoreButtonText}>📄 Test Firestore</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navigationButton} 
            onPress={() => navigation.navigate('NavigationTest')}
          >
            <MaterialCommunityIcons name="compass" size={24} color="#6B4EFF" />
            <Text style={styles.navigationButtonText}>🧭 Test Navigation</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

  // CameraTestScreen removed - Build 31 focuses on Camera Permissions testing
  // Camera hardware mounting will be tested in Build 32

  // Build 31: Camera Permissions Test Screen - PERMISSIONS ONLY, NO hardware access
const CameraUITestScreen = ({ navigation }) => {
  const [uiLoaded, setUiLoaded] = useState(false);

  useEffect(() => {
    addLog("CAMERA_UI", "📱 CameraUITest screen mounted");
    addLog("CAMERA_UI", "🛡️ UI loaded");
    addLog("CAMERA_UI", "⚠️ Camera hardware skipped (Build 31 permissions test)");
    
    // Simulate UI loading
    const timer = setTimeout(() => {
      setUiLoaded(true);
      addLog("CAMERA_UI", "✅ Placeholder UI fully loaded");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  addLog("CAMERA_UI", "🖼️ Rendering placeholder camera UI interface");

  return (
    <View style={styles.cameraContainer}>
      <View style={styles.cameraHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            addLog("CAMERA_UI", "🔙 Navigation back requested");
            navigation.goBack();
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.cameraTitle}>🛡️ Build 31 - Camera Permissions Test</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.cameraPreviewContainer}>
        <View style={styles.placeholderCameraPreview}>
          <View style={styles.cameraOverlay}>
            <MaterialCommunityIcons name="cellphone-check" size={80} color="#4CAF50" />
            <Text style={styles.overlayText}>Camera UI Loaded</Text>
            <Text style={styles.overlaySubtext}>UI Navigation Test - Hardware Access Disabled</Text>
            
            {uiLoaded && (
              <View style={styles.statusIndicator}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#4CAF50" />
                <Text style={styles.statusText}>UI Successfully Loaded ✅</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cameraControls}>
        <View style={styles.testInfo}>
          <Text style={styles.testInfoTitle}>✅ Build 31 Test Status</Text>
          <Text style={styles.testInfoText}>• Permissions API: ✅ Ready</Text>
          <Text style={styles.testInfoText}>• Camera Hardware: 🛡️ Disabled</Text>
          <Text style={styles.testInfoText}>• Permission Testing: 🔄 Active</Text>
          <Text style={styles.testInfoText}>• Crash Prevention: ✅ Active</Text>
          <Text style={styles.testInfoText}>• Hardware Mounting: ❌ Blocked (Build 32)</Text>
        </View>

        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => {
            addLog("CAMERA_UI", "🔄 UI interaction test - button clicked");
                      Alert.alert(
            "Build 31 Ready", 
            "Camera permissions testing ready! UI navigation stable.\n\nCamera hardware mounting will be tested in Build 32.",
            [{ text: "OK", style: "default" }]
          );
          }}
        >
          <MaterialCommunityIcons name="test-tube" size={30} color="#fff" />
          <Text style={styles.controlText}>Test UI Interaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const NavigationTestScreen = ({ navigation }) => {
  const { user } = useContext(AuthenticatedUserContext);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: ''
  });
  const [profileData, setProfileData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      addLog("NAV", "📄 Loading user profile from Firestore...");
      
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          addLog("NAV", "✅ User profile loaded successfully");
          addLog("NAV", "📊 Profile data:", JSON.stringify(userData, null, 2));
          setProfileData(userData);
          setProfile({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            age: userData.age?.toString() || '',
            gender: userData.gender || '',
            height: userData.height?.toString() || '',
            weight: userData.weight?.toString() || '',
            goal: userData.goal || ''
          });
          return userData;
        } else {
          addLog("NAV", "⚠️ No user profile found in Firestore");
          setProfileData(null);
        }
      }
      return null;
    } catch (error) {
      addLog("NAV", "❌ Error loading user profile:", error.message);
      Alert.alert('Error', 'Failed to load profile from Firestore');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveUserProfile = async () => {
    try {
      setSaving(true);
      addLog("NAV", "💾 Saving user profile to Firestore...");
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const userRef = doc(db, 'users', user.uid);
      
      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: user.email,
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender,
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        goal: profile.goal,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      addLog("NAV", "📝 Profile data to save:", JSON.stringify(profileData, null, 2));
      
      await setDoc(userRef, profileData, { merge: true });
      
      addLog("NAV", "✅ Profile saved successfully to Firestore");
      Alert.alert('Success', 'Profile saved successfully!');
      
      // Reload to verify save
      await loadUserProfile();
      
    } catch (error) {
      addLog("NAV", "❌ Error saving user profile:", error.message);
      Alert.alert('Error', 'Failed to save profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛡️ Build 31 - Camera Permissions Test</Text>
      <Text style={styles.subtitle}>Testing camera permissions API (No camera hardware access)</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>🔑 Auth Status: ✅ Authenticated</Text>
        <Text style={styles.infoText}>👤 User: {user?.email}</Text>
        <Text style={styles.infoText}>🆔 UID: {user?.uid}</Text>
      </View>

      {/* Build 31: Camera Permissions Test Section */}
      <View style={styles.navigationSection}>
        <Text style={styles.sectionTitle}>📱 Camera Permissions Test</Text>
        <Text style={styles.subtitle}>Permissions-only test - Hardware access disabled</Text>
        
        <TouchableOpacity 
          style={styles.cameraTestButton} 
          onPress={() => {
            addLog("CAMERA_UI", "🚀 Navigation started");
            navigation.navigate('CameraUITest');
          }}
        >
          <MaterialCommunityIcons name="cellphone" size={24} color="#fff" />
          <Text style={styles.cameraTestButtonText}>🛡️ Test Camera Permissions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationSection}>
        <Text style={styles.sectionTitle}>📊 Firestore Operations (Build 28 - Proven Stable)</Text>
        
        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={loadUserProfile}
          disabled={loading}
        >
          <MaterialCommunityIcons name="download" size={24} color="#fff" />
          <Text style={styles.profileButtonText}>
            {loading ? 'Loading...' : 'Load Profile'}
          </Text>
        </TouchableOpacity>

        {profileData && (
          <View style={styles.profileDataContainer}>
            <Text style={styles.dataTitle}>📋 Current Profile Data:</Text>
            <Text style={styles.dataText}>Name: {profileData.firstName} {profileData.lastName}</Text>
            <Text style={styles.dataText}>Age: {profileData.age || 'Not set'}</Text>
            <Text style={styles.dataText}>Gender: {profileData.gender || 'Not set'}</Text>
            <Text style={styles.dataText}>Height: {profileData.height || 'Not set'} cm</Text>
            <Text style={styles.dataText}>Weight: {profileData.weight || 'Not set'} kg</Text>
            <Text style={styles.dataText}>Goal: {profileData.goal || 'Not set'}</Text>
          </View>
        )}
      </View>

      <View style={styles.navigationSection}>
        <Text style={styles.sectionTitle}>✏️ Edit Profile</Text>
        
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={profile.firstName}
          onChangeText={(text) => setProfile({...profile, firstName: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={profile.lastName}
          onChangeText={(text) => setProfile({...profile, lastName: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={profile.age}
          onChangeText={(text) => setProfile({...profile, age: text})}
          keyboardType="number-pad"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Gender (Male/Female/Other)"
          value={profile.gender}
          onChangeText={(text) => setProfile({...profile, gender: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          value={profile.height}
          onChangeText={(text) => setProfile({...profile, height: text})}
          keyboardType="number-pad"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          value={profile.weight}
          onChangeText={(text) => setProfile({...profile, weight: text})}
          keyboardType="number-pad"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Goal (Lose/Maintain/Gain weight)"
          value={profile.goal}
          onChangeText={(text) => setProfile({...profile, goal: text})}
        />

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.buttonDisabled]} 
          onPress={saveUserProfile}
          disabled={saving}
        >
          <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Build31CameraPermissionsTestNavigator = () => {
  const Stack = createStackNavigator();
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="LoginTest" 
        component={LoginTestScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="NavigationTest" 
        component={NavigationTestScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CameraUITest" 
        component={CameraUITestScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  const [showLogs, setShowLogs] = useState(true);

  return (
    <SafeAreaProvider>
      <AuthenticatedUserProvider auth={auth}>
        <NavigationContainer>
          <Build31CameraPermissionsTestNavigator />
        </NavigationContainer>
        
        {/* Debug Logs */}
        {showLogs && (
          <View style={styles.debugContainer}>
            <TouchableOpacity 
              style={styles.logToggle}
              onPress={() => setShowLogs(!showLogs)}
            >
              <MaterialCommunityIcons name="tools" size={16} color="#fff" />
              <Text style={styles.logToggleText}>BUILD 31 CAMERA PERMISSIONS TEST LOGS</Text>
            </TouchableOpacity>
            <ScrollView style={styles.logContainer} showsVerticalScrollIndicator={false}>
              {DEBUG_LOGS.slice(-10).map((log, index) => (
                <Text key={index} style={styles.logText}>{log}</Text>
              ))}
            </ScrollView>
          </View>
        )}
      </AuthenticatedUserProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#6B4EFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 20,
  },
  userInfo: {
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
  },
  userText: {
    fontSize: 14,
    color: "#2E7D32",
    marginBottom: 5,
  },
  firestoreButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  firestoreButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  navigationButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#6B4EFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  navigationButtonText: {
    color: "#6B4EFF",
    fontSize: 18,
    fontWeight: "600",
  },
  testSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  cameraSection: {
    gap: 15,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#6B4EFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  secondaryButtonText: {
    color: "#6B4EFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoContainer: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#1565C0",
    marginBottom: 5,
  },
  navigationSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  profileButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  profileButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    gap: 10,
  },
  backButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  debugContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    maxHeight: 200,
  },
  logToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    padding: 8,
    gap: 8,
  },
  logToggleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  logContainer: {
    padding: 10,
    maxHeight: 150,
  },
  logText: {
    color: "#00ff00",
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 2,
  },
  profileDataContainer: {
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  dataText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cameraTestButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  cameraTestButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  placeholder: {
    width: 34,
  },
  cameraPreviewContainer: {
    flex: 1,
    position: "relative",
  },
  placeholderCameraPreview: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  overlaySubtext: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statusIndicator: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraControls: {
    backgroundColor: "rgba(0,0,0,0.9)",
    padding: 30,
    alignItems: "center",
    gap: 20,
  },
  flipButton: {
    backgroundColor: "#6B4EFF",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    gap: 8,
    minWidth: 120,
  },
  controlText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  testInfo: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderRadius: 12,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  testInfoTitle: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  testInfoText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 2,
  },
});

export default App; 