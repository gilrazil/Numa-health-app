import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert, Pressable } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Colors, auth, db } from '../config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../components';

export const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const loadUserData = async (currentUser) => {
    try {
      setLoading(true);
      setIsOffline(false);
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        console.log('✅ User data loaded for HomeScreen:', { 
          email: data.email,
          profileCompleted: data.profileCompleted,
          hasEssentialFields: !!(data.gender && data.age && data.height && data.weight && data.goal)
        });
      } else {
        console.log('⚠️ No user document found - this should not happen if RootNavigator is working correctly');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleRetry = () => {
    loadUserData(user);
  };

  const handleStartTracking = () => {
    navigation.navigate('MealCamera');
  };

  const isProfileIncomplete = () => {
    return userData?.gender === 'Not set' || 
           userData?.age === 'Not set' || 
           userData?.height === 'Not set' || 
           userData?.weight === 'Not set' || 
           userData?.goal === 'Not set';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
                  <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>
            Welcome to Numa
          </Text>
          {user && (
            <Text style={styles.userText}>
              Hello, {user.email?.split('@')[0] || 'User'}! 👋
            </Text>
          )}
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
          
          <Pressable 
            style={styles.secondaryFeatureCard}
            onPress={() => navigation.navigate('LogMeal')}
            android_ripple={{ color: 'rgba(107, 78, 255, 0.1)' }}
          >
            <View style={styles.secondaryFeatureIconContainer}>
              <MaterialCommunityIcons name="notebook-plus" size={28} color="#6B4EFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.secondaryFeatureTitle}>Manual Log</Text>
              <Text style={styles.secondaryFeatureSubtitle}>Add meal details manually</Text>
            </View>
          </Pressable>
        </View>
        
        {/* Modern Stats Card */}
        <View style={styles.statsCard}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#6B4EFF" />
          <Text style={styles.statsText}>
            Ready to track your nutrition and health goals!
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
      </View>
    </View>
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
  header: {
    paddingTop: 60,
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
});
