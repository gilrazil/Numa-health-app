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
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome to Numa Health
        </Text>
        {user && (
          <Text style={styles.userText}>
            Hello, {user.email || 'User'}!
          </Text>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>
          Your health journey starts here!
        </Text>
        
        {/* Main App Features */}
        <View style={styles.featuresContainer}>
          <Pressable 
            style={styles.featureButton}
            onPress={handleStartTracking}
          >
            <MaterialCommunityIcons name="camera" size={32} color={Colors.white} />
            <Text style={styles.featureButtonText}>Take Meal Photo</Text>
            <Text style={styles.featureButtonSubtext}>Snap a photo to analyze your meal</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.featureButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('LogMeal')}
          >
            <MaterialCommunityIcons name="notebook-plus" size={32} color={Colors.primary} />
            <Text style={[styles.featureButtonText, styles.secondaryButtonText]}>Manual Log</Text>
            <Text style={[styles.featureButtonSubtext, styles.secondaryButtonSubtext]}>Add meal details manually</Text>
          </Pressable>
        </View>
        
        {/* Quick Stats or Recent Activity could go here */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Ready to track your nutrition and health goals!
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.primary,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
  userText: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentText: {
    fontSize: 18,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresContainer: {
    gap: 15,
  },
  featureButton: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  featureButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
  featureButtonSubtext: {
    fontSize: 14,
    color: Colors.white,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.9,
  },
  secondaryButtonSubtext: {
    color: Colors.mediumGray,
  },
  statsContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  statsText: {
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
  },
  signOutButton: {
    backgroundColor: Colors.lightGray,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: Colors.mediumGray,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.mediumGray,
  },
});
