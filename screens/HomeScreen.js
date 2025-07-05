import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Colors, auth, db } from '../config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, AlphaBadge } from '../components';
import { log, logError, logWarn } from '../utils/logger';
import { Camera } from 'expo-camera';

log("[HOME] 🏗️ HomeScreen module loaded");

export const HomeScreen = ({ navigation }) => {
  console.log("[SCREEN] HomeScreen loaded");
  
  log("[HOME] 🚀 HomeScreen component called");
  log("[HOME] 🧭 Navigation prop received:", !!navigation);
  
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [cameraHardwareActive, setCameraHardwareActive] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [hardwareTesting, setHardwareTesting] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  log("[HOME] 🎯 HomeScreen state initialized");

  useEffect(() => {
    log("[HOME] ⚡ HomeScreen useEffect triggered");
    
    let isMounted = true;
    
    log("[HOME] 🔐 Setting up auth state listener");
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        log("[HOME] 🔔 HomeScreen auth state change:", user ? `User ${user.email || user.uid}` : 'No user');
        
        if (!isMounted) {
          log("[HOME] ⚠️ HomeScreen component unmounted, skipping update");
          return;
        }
        
        log("[HOME] ✅ Updating user state in HomeScreen");
        setUser(user);
        setAuthError(null);
        
        if (user) {
          log("[HOME] 👤 User found, loading user data");
          loadUserData(user);
        } else {
          log("[HOME] 🚫 No user, setting loading to false");
          setLoading(false);
        }
      },
      (error) => {
        logError('[HOME] 🔥 Auth state change error in HomeScreen:', error);
        logError('[HOME] 🔥 Auth error stack:', error.stack);
        if (isMounted) {
          log("[HOME] ❌ Setting auth error in HomeScreen");
          setAuthError('Authentication error occurred');
          setLoading(false);
        }
      }
    );

    // Cleanup subscription
    return () => {
      log("[HOME] 🧹 HomeScreen cleanup");
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loadUserData = async (currentUser) => {
    log("[HOME] 📊 loadUserData called for user:", currentUser?.uid);
    
    if (!currentUser?.uid) {
      log("[HOME] ⚠️ No valid user provided to loadUserData");
      setLoading(false);
      return;
    }
    
    try {
      log("[HOME] 🔄 Starting user data load");
      setLoading(true);
      setIsOffline(false);
      
      log("[HOME] 🔥 Creating Firestore document reference");
      const userDocRef = doc(db, 'users', currentUser.uid);
      log("[HOME] 📄 Getting user document from Firestore");
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        log("[HOME] ✅ User document exists");
        const data = userDoc.data();
        // Validate data before setting state
        if (data && typeof data === 'object') {
          log("[HOME] ✅ Valid user data received, updating state");
          setUserData(data);
          log('[HOME] ✅ User data loaded for HomeScreen:', { 
            email: data.email,
            profileCompleted: data.profileCompleted,
            hasEssentialFields: !!(data.gender && data.age && data.height && data.weight && data.goal)
          });
        } else {
          log("[HOME] ⚠️ Invalid user data received");
          setUserData(null);
        }
      } else {
        log("[HOME] ⚠️ No user document found - this should not happen if RootNavigator is working correctly");
        setUserData(null);
      }
    } catch (error) {
      logError('[HOME] 🔥 Error loading user data:', error);
      logError('[HOME] 🔥 Error stack:', error.stack);
      log("[HOME] 📶 Setting offline state");
      setIsOffline(true);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      log("[HOME] ✅ Setting loading to false");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    log("[HOME] 🚪 handleSignOut called");
    try {
      await signOut(auth);
      log('[HOME] ✅ Signed out successfully');
    } catch (error) {
      logError('[HOME] 🔥 Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleRetry = () => {
    log("[HOME] 🔄 handleRetry called");
    if (user) {
      loadUserData(user);
    }
  };

  const handleCameraHardware = async () => {
    log("[HOME] 📸 handleCameraHardware called - testing live camera preview");
    
    try {
      setHardwareTesting(true);
      setCameraError(null);
      
      log("[HOME] 🔐 Requesting camera permissions");
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      log("[HOME] 📊 Camera permission status:", status);
      setCameraPermission(status);
      
      if (status === 'granted') {
        log("[HOME] ✅ Camera permission granted, activating live preview");
        setCameraHardwareActive(true);
        Alert.alert('Live Preview Active', 'Camera live preview is now active! Build 33 test successful.');
      } else {
        log("[HOME] ❌ Camera permission denied");
        setCameraHardwareActive(false);
        Alert.alert('Permission Denied', 'Camera access was denied. Live preview cannot be activated.');
      }
    } catch (error) {
      logError('[HOME] 🔥 Error activating camera live preview:', error);
      setCameraError(error.message);
      setCameraHardwareActive(false);
      Alert.alert('Preview Error', 'Failed to activate camera live preview');
    } finally {
      setHardwareTesting(false);
    }
  };

  const handleCameraReady = () => {
    log("[HOME] 📸 Live preview ready callback triggered");
    setCameraReady(true);
  };

  const handleCameraError = (error) => {
    logError('[HOME] 🔥 Camera live preview error:', error);
    setCameraError(error.message);
    setCameraHardwareActive(false);
    Alert.alert('Preview Error', 'Camera live preview encountered an error');
  };

  const isProfileIncomplete = () => {
    if (!userData || typeof userData !== 'object') return false;
    
    return userData?.gender === 'Not set' || 
           userData?.age === 'Not set' || 
           userData?.height === 'Not set' || 
           userData?.weight === 'Not set' || 
           userData?.goal === 'Not set';
  };

  const getHardwareStatusIcon = () => {
    if (hardwareTesting) return "loading";
    if (cameraHardwareActive && cameraReady) return "camera-check";
    if (cameraHardwareActive) return "camera";
    if (cameraError) return "camera-off";
    return "camera-outline";
  };

  const getHardwareStatusColor = () => {
    if (hardwareTesting) return "#86868B";
    if (cameraHardwareActive && cameraReady) return "#34C759";
    if (cameraHardwareActive) return "#FF9500";
    if (cameraError) return "#FF3B30";
    return "#86868B";
  };

  const getHardwareStatusText = () => {
    if (hardwareTesting) return "Activating live preview...";
    if (cameraHardwareActive && cameraReady) return "Live Preview Working ✅";
    if (cameraHardwareActive) return "Preview Loading...";
    if (cameraError) return "Preview Error ❌";
    return "Tap to test live preview";
  };

  log("[HOME] 🎨 HomeScreen render cycle");
  log("[HOME] 📊 Render state:", { 
    hasUser: !!user, 
    hasUserData: !!userData, 
    loading, 
    isOffline, 
    hasAuthError: !!authError,
    cameraPermission,
    cameraHardwareActive,
    cameraReady,
    hardwareTesting,
    cameraError
  });

  // Show error state for auth errors
  if (authError) {
    log("[HOME] ❌ Rendering auth error screen");
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={Colors.red} />
        <Text style={styles.errorText}>Authentication Error</Text>
        <Text style={styles.errorSubtext}>{authError}</Text>
        <Button onPress={() => setAuthError(null)} style={styles.retryButton}>
          <Text>Retry</Text>
        </Button>
      </View>
    );
  }

  if (loading) {
    log("[HOME] ⏳ Rendering loading screen");
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Safety check for user
  if (!user?.email) {
    log("[HOME] 🚫 No user session - rendering no user screen");
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No user session found</Text>
        <Button onPress={handleSignOut} style={styles.retryButton}>
          <Text>Sign Out</Text>
        </Button>
      </View>
    );
  }

  log("[HOME] 🎉 Rendering main HomeScreen content");

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Modern Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.welcomeText}>
              Welcome to Numa
            </Text>
            <AlphaBadge style={styles.alphaBadgeHeader} />
          </View>
          <Text style={styles.userText}>
            Hello, {user.email?.split('@')[0] || 'User'}! 👋
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.tagline}>
          Your health journey starts here
        </Text>
        
        {/* Camera Preview Section */}
        {cameraHardwareActive && (
          <View style={styles.cameraPreviewContainer}>
            <Camera
              ref={setCameraRef}
              style={styles.cameraPreview}
              type={Camera.Constants.Type.back}
              onCameraReady={handleCameraReady}
              onMountError={handleCameraError}
            />
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraStatusIndicator}>
                <MaterialCommunityIcons 
                  name={cameraReady ? "check-circle" : "loading"} 
                  size={24} 
                  color={cameraReady ? "#34C759" : "#FF9500"} 
                />
                <Text style={styles.cameraStatusText}>
                  {cameraReady ? "Camera Ready ✅" : "Loading..."}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Modern Feature Cards */}
        <View style={styles.featuresContainer}>
          <Pressable 
            style={[styles.primaryFeatureCard, cameraHardwareActive && styles.cameraActiveCard]}
            onPress={handleCameraHardware}
            disabled={hardwareTesting}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
          >
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons 
                name={getHardwareStatusIcon()} 
                size={28} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.primaryFeatureTitle}>Test Live Preview</Text>
              <Text style={styles.primaryFeatureSubtitle}>
                {getHardwareStatusText()}
              </Text>
            </View>
          </Pressable>

          {/* Hardware Status Display */}
          {(cameraHardwareActive || cameraError) && (
            <View style={[styles.hardwareStatusCard, 
              cameraReady ? styles.hardwareWorking : 
              cameraError ? styles.hardwareError : styles.hardwareLoading]}>
              <MaterialCommunityIcons 
                name={cameraReady ? "check-circle" : cameraError ? "alert-circle" : "loading"} 
                size={24} 
                color={getHardwareStatusColor()} 
              />
              <Text style={[styles.hardwareStatusText]}>
                {cameraReady ? 'Live Preview Working ✅' : 
                 cameraError ? `Preview Error: ${cameraError}` : 
                 'Live Preview Loading...'}
              </Text>
            </View>
          )}
          
          <View 
            style={[styles.secondaryFeatureCard, styles.disabledCard]}
          >
            <View style={[styles.secondaryFeatureIconContainer, styles.disabledIconContainer]}>
              <MaterialCommunityIcons name="notebook-plus" size={28} color="#C1C1C6" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.secondaryFeatureTitle, styles.disabledTitle]}>Manual Log</Text>
              <Text style={[styles.secondaryFeatureSubtitle, styles.disabledSubtitle]}>Coming soon...</Text>
            </View>
          </View>
        </View>
        
        {/* Modern Stats Card */}
        <View style={[styles.statsCard, styles.disabledCard]}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#C1C1C6" />
          <Text style={[styles.statsText, styles.disabledText]}>
            Advanced tracking coming soon!
          </Text>
        </View>
      </View>

      {/* Modern Footer */}
      <View style={styles.footer}>
        <Pressable 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          android_ripple={{ color: 'rgba(134, 134, 139, 0.1)' }}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#86868B" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
        
        <Text style={styles.versionText}>
          Version 1.0.33 - Build 33
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.red,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#6B4EFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  alphaBadgeHeader: {
    transform: [{ scale: 0.9 }],
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  userText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tagline: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '400',
    letterSpacing: -0.24,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  primaryFeatureCard: {
    backgroundColor: '#6B4EFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryFeatureCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E1E4E8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  secondaryFeatureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  primaryFeatureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.24,
  },
  primaryFeatureSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    letterSpacing: -0.08,
  },
  secondaryFeatureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
    letterSpacing: -0.24,
  },
  secondaryFeatureSubtitle: {
    fontSize: 14,
    color: '#86868B',
    fontWeight: '400',
    letterSpacing: -0.08,
  },
  cameraPreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraPreview: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraStatusIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraStatusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  permissionStatusCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionGranted: {
    borderColor: '#34C759',
    backgroundColor: '#F0FFF4',
  },
  permissionDenied: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF0F0',
  },
  permissionStatusText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  permissionGrantedText: {
    color: '#34C759',
  },
  permissionDeniedText: {
    color: '#FF3B30',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E1E4E8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statsText: {
    fontSize: 15,
    color: '#86868B',
    marginLeft: 12,
    fontWeight: '400',
    letterSpacing: -0.24,
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E1E4E8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    color: '#86868B',
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: -0.24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#86868B',
    fontWeight: '400',
  },
  // Disabled states
  disabledCard: {
    opacity: 0.6,
    borderColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  disabledIconContainer: {
    backgroundColor: '#F0F0F0',
  },
  disabledTitle: {
    color: '#C1C1C6',
  },
  disabledSubtitle: {
    color: '#C1C1C6',
  },
  disabledText: {
    color: '#C1C1C6',
  },
  versionText: {
    fontSize: 12,
    color: '#86868B',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
  },
  cameraActiveCard: {
    backgroundColor: '#FF9500',
  },
  hardwareWorking: {
    borderColor: '#34C759',
    backgroundColor: '#F0FFF4',
  },
  hardwareError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF0F0',
  },
  hardwareLoading: {
    borderColor: '#FF9500',
    backgroundColor: '#FFF0F0',
  },
  hardwareStatusCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  hardwareStatusText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
});
