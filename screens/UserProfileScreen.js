import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { TextInput, Button, FormErrorMessage } from '../components';
import { Colors, auth, db, firebase } from '../config';

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

const UserProfileScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [errorState, setErrorState] = useState('');
  
  // Check if there's existing user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleSaveProfile = async (values) => {
    try {
      setLoading(true);
      const userRef = db.collection('users').doc(auth.currentUser.uid);
      
      await userRef.update({
        gender: values.gender,
        age: Number(values.age),
        height: Number(values.height),
        weight: Number(values.weight),
        profileCompleted: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      Alert.alert('Success', 'Your profile has been updated successfully');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorState(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const upgradeAnonymousAccount = async () => {
    // This function will be implemented to allow users to upgrade to a full account
    // by linking their anonymous account with an email/password or other auth provider
    Alert.alert('Coming Soon', 'Account upgrade will be available soon!');
  };
  
  if (loading && !userData) {
    return <ActivityIndicator size="large" color={Colors.orange} style={styles.loader} />;
  }
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Your Profile</Text>
        
        <Formik
          initialValues={{
            gender: userData?.gender || '',
            age: userData?.age ? String(userData.age) : '',
            height: userData?.height ? String(userData.height) : '',
            weight: userData?.weight ? String(userData.weight) : ''
          }}
          validationSchema={profileValidationSchema}
          onSubmit={handleSaveProfile}
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
              
              {errorState ? (
                <FormErrorMessage error={errorState} visible={true} />
              ) : null}
              
              <Button 
                style={styles.button} 
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Saving...' : 'Save Profile'}
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
    </View>
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
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: Colors.orange,
    padding: 15,
    borderRadius: 8,
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