import React, { useState, useEffect } from "react";
import { Text, StyleSheet, Alert } from "react-native";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as LocalAuthentication from 'expo-local-authentication';

import { View, TextInput, Logo, Button, FormErrorMessage, BiometricSetupModal } from "../components";
import { Images, Colors, auth, db } from "../config";
import { useTogglePasswordVisibility } from "../hooks";
import { signupValidationSchema } from "../utils";
import { BiometricService } from "../services/BiometricService";
import { FirstLaunchService } from "../services/FirstLaunchService";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const SignupScreen = ({ navigation, route }) => {
  // Get user data from previous screens
  const userData = route.params || {};
  
  console.log('🔍 SignupScreen - Received userData:', JSON.stringify(userData, null, 2));
  
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

  const handleOnSignUp = async (values, actions) => {
    const { email, password } = values;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      console.log('User created successfully:', user.uid);
      
      // Save complete user profile data from onboarding flow
      const userDataToSave = {
        userId: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
        // Include all onboarding data if available
        ...(userData.gender && { gender: userData.gender }),
        ...(userData.age && { age: userData.age }),
        ...(userData.height && { height: userData.height }),
        ...(userData.weight && { weight: userData.weight }),
        ...(userData.goal && { goal: userData.goal }),
        // Mark profile as completed if we have all required fields
        profileCompleted: !!(userData.gender && userData.age && userData.height && userData.weight && userData.goal)
      };
      
      console.log('💾 SignupScreen - Data to save:', JSON.stringify(userDataToSave, null, 2));
      console.log('✅ Profile completed will be set to:', userDataToSave.profileCompleted);
      
      try {
        await setDoc(doc(db, 'users', user.uid), userDataToSave);
        console.log('Complete user profile saved to Firestore:', userDataToSave);
      } catch (firestoreError) {
        console.log('Firestore error (user still created):', firestoreError);
        // Still save basic data
        await setDoc(doc(db, 'users', user.uid), userDataToSave, { merge: true });
      }
      
      // Store user credentials for potential biometric setup
      setUserCredentials({ email: values.email, password: values.password });
      
      // Mark onboarding as completed
      await FirstLaunchService.markOnboardingCompleted();
      await FirstLaunchService.markAsLaunched();
      
      console.log('Signup and profile setup completed successfully');
      
      // Show biometric setup modal if available
      if (biometricAvailable) {
        setShowBiometricModal(true);
        console.log('🔐 Showing biometric setup modal');
      } else {
        console.log('⚠️ Biometric not available on this device');
      }
      // If biometric not available, user will be automatically navigated by auth state change
    } catch (error) {
      console.log('Signup error:', error.message);
      actions.setFieldError('general', error.message);
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
          onSubmit={(values) => handleOnSignUp(values)}
        >
          {({
            values,
            touched,
            errors,
            handleChange,
            handleSubmit,
            handleBlur,
            actions,
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
    backgroundColor: '#6B4EFF', // Explicit purple color
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff', // Explicit white color
    fontWeight: "700",
  },
  borderlessButtonContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  }
});
