import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, auth, db } from '../config';
import { Button } from '../components';

export const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async (showRetryAlert = false) => {
    try {
      setLoading(true);
      setIsOffline(false);
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log('Fetching user data for:', currentUser.uid);
        console.log('Current user email:', currentUser.email);
        
        // Create basic user data from auth user
        const basicUserData = {
          userId: currentUser.uid,
          email: currentUser.email,
          gender: 'Not set',
          age: 'Not set',
          height: 'Not set',
          weight: 'Not set',
          goal: 'Not set',
          createdAt: new Date().toISOString(),
        };
        
        try {
          // Force Firestore to go online
          await db.enableNetwork();
          console.log('Firestore network enabled');
          
          // Try to get user document from Firestore with a timeout
          const userDocPromise = db.collection('users').doc(currentUser.uid).get();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 5000)
          );
          
          const userDoc = await Promise.race([userDocPromise, timeoutPromise]);
          
          if (userDoc.exists) {
            console.log('User document found - ONLINE');
            const firestoreData = userDoc.data();
            
            // Use the Firestore data directly, with proper fallbacks
            setUserData({
              userId: firestoreData.userId || currentUser.uid,
              email: firestoreData.email || currentUser.email,
              gender: firestoreData.gender || 'Not set',
              age: firestoreData.age !== undefined ? firestoreData.age : 'Not set',
              height: firestoreData.height !== undefined ? firestoreData.height : 'Not set',
              weight: firestoreData.weight !== undefined ? firestoreData.weight : 'Not set',
              goal: firestoreData.goal || 'Not set',
              createdAt: firestoreData.createdAt || new Date().toISOString(),
            });
            setIsOffline(false);
          } else {
            console.log('User document not found in Firestore for UID:', currentUser.uid);
            
            setUserData(basicUserData);
            setIsOffline(false);
          }
        } catch (firestoreError) {
          console.log('Firestore error, using basic auth data:', firestoreError.message);
          // Use basic auth data when Firestore is unavailable
          setUserData(basicUserData);
          setIsOffline(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsOffline(true);
      
      if (showRetryAlert) {
        Alert.alert(
          'Connection Issue',
          'Unable to connect to the server. You can continue using the app in offline mode.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleRetry = () => {
    fetchUserData(true);
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isOffline && (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineIcon}>📱</Text>
          <Text style={styles.offlineText}>Offline Mode</Text>
          <Pressable
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.title}>Welcome to Numa!</Text>
      <Text style={styles.subtitle}>Your health journey starts here</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Profile</Text>
        <Text style={styles.item}>Email: {userData?.email || 'Not available'}</Text>
        <Text style={styles.item}>Gender: {userData?.gender || 'Not set'}</Text>
        <Text style={styles.item}>Age: {userData?.age !== undefined && userData?.age !== 'Not set' ? `${userData.age} years` : 'Not set'}</Text>
        <Text style={styles.item}>Height: {userData?.height !== undefined && userData?.height !== 'Not set' ? `${userData.height} cm` : 'Not set'}</Text>
        <Text style={styles.item}>Weight: {userData?.weight !== undefined && userData?.weight !== 'Not set' ? `${userData.weight} kg` : 'Not set'}</Text>
        <Text style={styles.item}>Goal: {userData?.goal || 'Not set'}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleStartTracking}
      >
        <Text style={styles.buttonText}>Start Tracking</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.button, styles.signOutButton, pressed && styles.buttonPressed]}
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  offlineContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  offlineIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  offlineText: {
    flex: 1,
    fontSize: 16,
    color: '#856404',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  item: {
    fontSize: 16,
    paddingVertical: 2,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
