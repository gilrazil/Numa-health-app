import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Colors, auth, db } from '../config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, AlphaBadge } from '../components';
import { log, logError, logWarn } from '../utils/logger';

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

  const handleStartTracking = () => {
    log("[HOME] 📸 handleStartTracking called - navigating to MealCamera");
    navigation.navigate('MealCamera');
  };

  const isProfileIncomplete = () => {
    if (!userData || typeof userData !== 'object') return false;
    
    return userData?.gender === 'Not set' || 
           userData?.age === 'Not set' || 
           userData?.height === 'Not set' || 
           userData?.weight === 'Not set' || 
           userData?.goal === 'Not set';
  };

  log("[HOME] 🎨 HomeScreen render cycle");
  log("[HOME] 📊 Render state:", { 
    hasUser: !!user, 
    hasUserData: !!userData, 
    loading, 
    isOffline, 
    hasAuthError: !!authError 
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
        
        {/* Modern Feature Cards */}
        <View style={styles.featuresContainer}>
          <Pressable 
            style={styles.primaryFeatureCard}
            onPress={handleStartTracking}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
          >
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons name="camera" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.primaryFeatureTitle}>Take Meal Photo</Text>
              <Text style={styles.primaryFeatureSubtitle}>Snap a photo to analyze your meal</Text>
            </View>
          </Pressable>
          
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
          Version 1.0.24 - Build 24
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
});
