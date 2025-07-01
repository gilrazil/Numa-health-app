import React, { useState, useEffect } from 'react';
import { 
import { log, logError, logWarn } from '../utils/logger';
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { TextInput, Button, FormErrorMessage } from '../components';
import { Colors, auth, db } from '../config';

const profileValidationSchema = Yup.object().shape({
  gender: Yup.string().required('Gender is required'),
  age: Yup.number()
    .required('Age is required')
    .min(10, 'Age must be at least 10')
    .max(120, 'Age must be less than 120'),
  height: Yup.number()
    .required('Height is required')
    .min(50, 'Height must be at least 50cm')
    .max(250, 'Height must be less than 250cm'),
  weight: Yup.number()
    .required('Weight is required')
    .min(20, 'Weight must be at least 20kg')
    .max(500, 'Weight must be less than 500kg'),
});

const UserProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorState, setErrorState] = useState('');
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  const loadProfile = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Error', 'Please log in first');
        navigation.navigate('Login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || auth.currentUser.email || '',
          age: userData.age?.toString() || '',
          gender: userData.gender || '',
          height: userData.height?.toString() || '',
          weight: userData.weight?.toString() || '',
          goal: userData.goal || ''
        });
      } else {
        // Set default values if no profile exists
        setProfile(prev => ({
          ...prev,
          email: auth.currentUser.email || ''
        }));
      }
    } catch (error) {
      logError('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  const saveProfile = async () => {
    try {
      setSaving(true);
      
      if (!auth.currentUser) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender,
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        goal: profile.goal,
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, profileData, { merge: true });
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      logError('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };
  
  const upgradeAnonymousAccount = async () => {
    // This function will be implemented to allow users to upgrade to a full account
    // by linking their anonymous account with an email/password or other auth provider
    Alert.alert('Coming Soon', 'Account upgrade will be available soon!');
  };
  
  if (loading && !profile.email) {
    return <ActivityIndicator size="large" color={Colors.orange} style={styles.loader} />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Your Profile</Text>
        
        <Formik
          initialValues={{
            gender: profile.gender || '',
            age: profile.age || '',
            height: profile.height || '',
            weight: profile.weight || '',
            goal: profile.goal || ''
          }}
          validationSchema={profileValidationSchema}
          onSubmit={saveProfile}
        >
          {({
            values,
            touched,
            errors,
            handleChange,
            handleSubmit,
            handleBlur,
          }) => (
            <>
              <Text style={styles.label}>Gender</Text>
              <TextInput
                name="gender"
                placeholder="Male, Female, or Other"
                value={values.gender}
                onChangeText={handleChange('gender')}
                onBlur={handleBlur('gender')}
                leftIconName="account"
              />
              <FormErrorMessage error={errors.gender} visible={touched.gender} />
              
              <Text style={styles.label}>Age</Text>
              <TextInput
                name="age"
                placeholder="Your age in years"
                value={values.age}
                onChangeText={handleChange('age')}
                onBlur={handleBlur('age')}
                keyboardType="number-pad"
                leftIconName="calendar"
              />
              <FormErrorMessage error={errors.age} visible={touched.age} />
              
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                name="height"
                placeholder="Your height in centimeters"
                value={values.height}
                onChangeText={handleChange('height')}
                onBlur={handleBlur('height')}
                keyboardType="number-pad"
                leftIconName="ruler"
              />
              <FormErrorMessage error={errors.height} visible={touched.height} />
              
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                name="weight"
                placeholder="Your weight in kilograms"
                value={values.weight}
                onChangeText={handleChange('weight')}
                onBlur={handleBlur('weight')}
                keyboardType="number-pad"
                leftIconName="weight"
              />
              <FormErrorMessage error={errors.weight} visible={touched.weight} />
              
              <Text style={styles.label}>Goal</Text>
              <TextInput
                name="goal"
                placeholder="Your fitness goal"
                value={values.goal}
                onChangeText={handleChange('goal')}
                onBlur={handleBlur('goal')}
                leftIconName="target"
              />
              <FormErrorMessage error={errors.goal} visible={touched.goal} />
              
              {errorState ? (
                <FormErrorMessage error={errorState} visible={true} />
              ) : null}
              
              <Button 
                style={styles.button} 
                onPress={handleSubmit}
                disabled={saving}
              >
                <Text style={styles.buttonText}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Text>
              </Button>
              
              {auth.currentUser?.isAnonymous && (
                <Button 
                  style={[styles.button, styles.upgradeButton]} 
                  onPress={upgradeAnonymousAccount}
                >
                  <Text style={styles.buttonText}>Upgrade to Full Account</Text>
                </Button>
              )}
            </>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    color: Colors.black,
  },
  button: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  upgradeButton: {
    backgroundColor: '#8a56ac', // Purple color for Numa
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserProfileScreen; 