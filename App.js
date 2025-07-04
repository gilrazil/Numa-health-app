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
import { AuthenticatedUserProvider, AuthenticatedUserContext } from "./providers";
import { auth, db } from "./config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

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
addLog("INIT", "🚀 Build 26 - Firestore Testing initialized");
addLog("INIT", "📊 Testing user profile creation and retrieval");
addLog("INIT", "🔥 Firebase Config:", auth?.app?.name || "No app name");
addLog("INIT", "💾 Firestore Config:", db?.app?.name || "No Firestore app name");

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
console.log("[INIT] 🧪 Build 26 - Firestore Testing Navigator components loaded");

// Build 26 Test Screens
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
      addLog("DB", "❌ No user logged in, cannot test Firestore");
      Alert.alert("Error", "Please login first");
      return;
    }

    addLog("DB", "🔥 Starting Firestore test");
    setLoading(true);

    try {
      // Create user profile data
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Test User",
        age: 57,
        height: 178,
        weight: 91,
        gender: "Male",
        goal: "Reduce weight",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        build: "26",
        testData: true
      };

      addLog("DB", "📄 Creating user profile document");
      addLog("DB", "📊 Profile data:", JSON.stringify(userProfile, null, 2));

      // Save to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, userProfile, { merge: true });
      
      addLog("DB", "✅ User profile saved to Firestore");
      addLog("DB", "🔍 Retrieving user profile from Firestore");

      // Retrieve from Firestore
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const retrievedData = docSnap.data();
        addLog("DB", "✅ User profile retrieved from Firestore");
        addLog("DB", "📊 Retrieved data:", JSON.stringify(retrievedData, null, 2));
        
        Alert.alert(
          "🎉 Firestore Test Success!",
          `Profile saved and retrieved successfully!\n\nUID: ${retrievedData.uid}\nEmail: ${retrievedData.email}\nAge: ${retrievedData.age}\nGoal: ${retrievedData.goal}`,
          [{ text: "OK" }]
        );
      } else {
        addLog("DB", "❌ No document found after save");
        Alert.alert("Error", "Profile was saved but could not be retrieved");
      }

    } catch (error) {
      addLog("DB", "❌ Firestore test failed:", error.message);
      Alert.alert("Firestore Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Build 26 - Firestore Test</Text>
      
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
              <Text style={styles.buttonText}>🔐 Login</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>🎉 LOGIN SUCCESSFUL!</Text>
          <Text style={styles.message}>✅ Firebase authentication is working!</Text>
          <Text style={styles.userInfo}>👤 User: {user?.email}</Text>
          <Text style={styles.userInfo}>🆔 UID: {user?.uid}</Text>
          
          <Text style={styles.subtitle}>Step 2: Test Firestore Operations</Text>
          <TouchableOpacity 
            style={[styles.button, styles.firestoreButton, loading && styles.buttonDisabled]} 
            onPress={handleTestFirestore}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>🔥 Test Firestore</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.navButton]} 
            onPress={() => navigation.navigate("Navigation")}
          >
            <Text style={styles.buttonText}>🧭 Test Navigation</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const NavigationTestScreen = ({ navigation }) => {
  const { user } = useContext(AuthenticatedUserContext);
  const [firestoreData, setFirestoreData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUserProfile = async () => {
    if (!user) {
      addLog("NAV", "❌ No user in context");
      return;
    }

    addLog("NAV", "📊 Loading user profile from Firestore");
    setLoading(true);

    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirestoreData(data);
        addLog("NAV", "✅ User profile loaded from Firestore");
        addLog("NAV", "📊 Profile data:", JSON.stringify(data, null, 2));
      } else {
        addLog("NAV", "❌ No user profile found in Firestore");
      }
    } catch (error) {
      addLog("NAV", "❌ Error loading profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧭 Navigation Test</Text>
      <Text style={styles.subtitle}>Testing auth context across navigation</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>🔐 Auth Status: {user ? "✅ Authenticated" : "❌ Not authenticated"}</Text>
        {user && (
          <>
            <Text style={styles.statusText}>👤 User: {user.email}</Text>
            <Text style={styles.statusText}>🆔 UID: {user.uid}</Text>
          </>
        )}
      </View>

      <Text style={styles.subtitle}>📊 Firestore Data</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : firestoreData ? (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>✅ Profile loaded successfully!</Text>
          <Text style={styles.dataText}>📧 Email: {firestoreData.email}</Text>
          <Text style={styles.dataText}>👤 Age: {firestoreData.age}</Text>
          <Text style={styles.dataText}>📏 Height: {firestoreData.height}cm</Text>
          <Text style={styles.dataText}>⚖️ Weight: {firestoreData.weight}kg</Text>
          <Text style={styles.dataText}>🎯 Goal: {firestoreData.goal}</Text>
          <Text style={styles.dataText}>🔢 Build: {firestoreData.build}</Text>
        </View>
      ) : (
        <Text style={styles.dataText}>❌ No profile data found</Text>
      )}
      
      <TouchableOpacity 
        style={[styles.button, styles.navButton]} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>🔙 Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Build 26 Test Navigator
const Build26TestNavigator = () => {
  const Stack = createStackNavigator();
  
  addLog("NAV", "🧭 Build26TestNavigator initialized");
  
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: "#2196F3" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "bold" }
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginTestScreen} 
        options={{ title: "🔥 Build 26 - Firestore Test" }}
      />
      <Stack.Screen 
        name="Navigation" 
        component={NavigationTestScreen} 
        options={{ title: "🧭 Navigation Test" }}
      />
    </Stack.Navigator>
  );
};

console.log("[INIT] 🧪 Build26TestNavigator component defined");

const App = () => {
  console.log("[INIT] 🔄 App component function called");
  console.log("[INIT] ✅ Build 26 debug mode active");
  console.log("[INIT] 📱 Platform:", Platform.OS);
  console.log("[INIT] 🔥 About to test Firestore + authentication + navigation components");
  
  // Test logs removed - system verified working
  
  console.log("[INIT] 🚀 About to render AuthenticatedUserProvider + NavigationContainer + Firestore test");
  console.log("[INIT] 🔐 Auth instance status for provider:", auth ? "Available" : "Not available");
  console.log("[INIT] 💾 Firestore instance status:", db ? "Available" : "Not available");
  
  // NavigationContainer at root level with split screen inside
  return (
    <SafeAreaProvider>
      <AuthenticatedUserProvider auth={auth}>
        <NavigationContainer>
          <View style={styles.appContainer}>
            {/* Navigation Section */}
            <View style={styles.navigationContainer}>
              <Build26TestNavigator />
            </View>
            
            {/* Debug Logs Section */}
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>🔧 BUILD 26 DEBUG LOGS</Text>
              <ScrollView style={styles.debugScroll}>
                {DEBUG_LOGS.map((log, index) => (
                  <Text key={index} style={[
                    styles.debugText,
                    log.includes("ERROR") ? styles.logError : 
                    log.includes("WARN") ? styles.logWarn : styles.logInfo
                  ]}>
                    {log}
                  </Text>
                ))}
              </ScrollView>
            </View>
          </View>
        </NavigationContainer>
      </AuthenticatedUserProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  appContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  navigationContainer: {
    flex: 2, // Takes up 2/3 of the screen
    backgroundColor: "#ffffff",
  },
  debugSection: {
    flex: 1, // Takes up 1/3 of the screen
    backgroundColor: "#000000",
    borderTopWidth: 2,
    borderTopColor: "#00ff00",
  },
  debugTitle: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
    textAlign: "center",
  },
  debugScroll: {
    flex: 1,
    paddingHorizontal: 10,
  },
  debugText: {
    color: "#4CAF50",
    fontSize: 10,
    fontFamily: "monospace",
    marginBottom: 2,
  },
  logInfo: {
    color: "#00ff00",
  },
  logWarn: {
    color: "#ffaa00",
  },
  logError: {
    color: "#ff4444",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: "#388E3C",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  userInfo: {
    fontSize: 14,
    color: "#1976D2",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#ffffff",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 200,
    alignItems: "center",
  },
  firestoreButton: {
    backgroundColor: "#FF5722",
  },
  navButton: {
    backgroundColor: "#4CAF50",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusContainer: {
    backgroundColor: "#E8F5E8",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
  },
  statusText: {
    fontSize: 14,
    color: "#2E7D32",
    marginBottom: 5,
  },
  dataContainer: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
  },
  dataText: {
    fontSize: 14,
    color: "#1976D2",
    marginBottom: 5,
  },
});

export default App; 