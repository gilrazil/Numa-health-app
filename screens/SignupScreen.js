import React, { useState, useEffect } from "react";
import { Text, StyleSheet, Alert } from "react-native";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as LocalAuthentication from 'expo-local-authentication';

import { View, TextInput, Logo, Button, FormErrorMessage, BiometricSetupModal } from "../components";
import { Images, Colors, auth, db, firebase } from "../config";
import { useTogglePasswordVisibility } from "../hooks";
import { signupValidationSchema } from "../utils";
import { BiometricService } from "../services/BiometricService";

export const SignupScreen = ({ navigation, route }) => {
  // Get user data from previous screens
  const userData = route.params || {};
  
  const [errorState, setErrorState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [userCredentials, setUserCredentials] = useState(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const {
    passwordVisibility,
    handlePasswordVisibility,
    rightIcon,
    handleConfirmPasswordVisibility,
    confirmPasswordIcon,
    confirmPasswordVisibility,
  } = useTogglePasswordVisibility();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const { isAvailable } = await BiometricService.isBiometricAvailable();
    setBiometricAvailable(isAvailable);
  };

  const handleSignUp = async (values) => {
    const { email, password } = values;
    
    if (!email || !password) {
      setErrorState('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setErrorState('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setErrorState('');
    
    try {
      // Create user account
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Prepare user data from route params
      const userDataToSave = {
        userId: user.uid,
        email: user.email,
        gender: route.params?.gender || null,
        age: route.params?.age || null,
        height: route.params?.height || null,
        weight: route.params?.weight || null,
        goal: route.params?.goal || null,
        createdAt: new Date().toISOString(),
      };

      // Try to save to Firestore
      try {
        // Ensure Firestore is online before attempting to save
        await db.enableNetwork();
        await db.collection('users').doc(user.uid).set(userDataToSave);
        console.log('✅ User data saved to Firestore successfully');
      } catch (firestoreError) {
        console.log('❌ Could not save to Firestore:', firestoreError.code, firestoreError.message);
        
        // Try alternative approach if the first attempt fails
        if (firestoreError.code === 'invalid-argument' || firestoreError.message.includes('stream token')) {
          console.log('🔄 Retrying Firestore save with different approach...');
          try {
            // Wait a moment and try again
            await new Promise(resolve => setTimeout(resolve, 1000));
            await db.collection('users').doc(user.uid).set(userDataToSave, { merge: true });
            console.log('✅ User data saved to Firestore on retry');
          } catch (retryError) {
            console.log('❌ Retry also failed:', retryError.code, retryError.message);
            // Don't show error to user as account was created successfully
          }
        }
      }

      // Store credentials for biometric setup
      setUserCredentials({ email, password });

      // Check if biometric authentication is available and show setup modal
      const isAvailable = await BiometricService.isBiometricAvailable();
      if (isAvailable) {
        setShowBiometricModal(true);
      }
      
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setErrorState(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricSetupComplete = (wasSetup) => {
    console.log(`Biometric setup ${wasSetup ? 'completed' : 'skipped'}`);
    // User will be automatically navigated to HomeScreen by the auth state change
  };

  return (
    <View isSafe style={styles.container}>
      <KeyboardAwareScrollView enableOnAndroid={true}>
        {/* LogoContainer: consist app logo and screen title */}
        <View style={styles.logoContainer}>
          <Logo uri={Images.logo} />
          <Text style={styles.screenTitle}>Create your account</Text>
          <Text style={styles.subtitle}>
            Last step! Set up your login details
          </Text>
        </View>
        {/* Formik Wrapper */}
        <Formik
          initialValues={{
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={signupValidationSchema}
          onSubmit={(values) => handleSignUp(values)}
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
              {/* Input fields */}
              <TextInput
                name="email"
                leftIconName="email"
                placeholder="Enter email"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoFocus={true}
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
              />
              <FormErrorMessage error={errors.email} visible={touched.email} />
              <TextInput
                name="password"
                leftIconName="key-variant"
                placeholder="Enter password"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={passwordVisibility}
                textContentType="newPassword"
                rightIcon={rightIcon}
                handlePasswordVisibility={handlePasswordVisibility}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
              />
              <FormErrorMessage
                error={errors.password}
                visible={touched.password}
              />
              <TextInput
                name="confirmPassword"
                leftIconName="key-variant"
                placeholder="Confirm password"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={confirmPasswordVisibility}
                textContentType="password"
                rightIcon={confirmPasswordIcon}
                handlePasswordVisibility={handleConfirmPasswordVisibility}
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
              />
              <FormErrorMessage
                error={errors.confirmPassword}
                visible={touched.confirmPassword}
              />
              {/* Display Screen Error Messages */}
              {errorState !== "" ? (
                <FormErrorMessage error={errorState} visible={true} />
              ) : null}
              {/* Signup button */}
              <Button style={styles.button} onPress={handleSubmit} disabled={isLoading}>
                <Text style={styles.buttonText}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </Button>
            </>
          )}
        </Formik>
        
        {/* Button to navigate to Login screen */}
        <Button
          style={styles.borderlessButtonContainer}
          borderless
          title={"Already have an account?"}
          onPress={() => navigation.navigate("Login")}
        />
      </KeyboardAwareScrollView>

      {/* Biometric Setup Modal */}
      <BiometricSetupModal
        visible={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSetupComplete={handleBiometricSetupComplete}
        userCredentials={userCredentials}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
  },
  logoContainer: {
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.black,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.darkgrey,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: Colors.orange,
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: "700",
  },
  borderlessButtonContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  }
});
