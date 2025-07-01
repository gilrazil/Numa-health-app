import React, { useState, useEffect } from "react";
import { Text, StyleSheet, Alert, Platform, ScrollView } from "react-native";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


import { View, TextInput, Logo, Button, FormErrorMessage, AlphaBadge } from "../components";
import { Images, Colors, auth, db } from "../config";
import { useTogglePasswordVisibility } from "../hooks";
import { signupValidationSchema } from "../utils";
import { FirstLaunchService } from "../services/FirstLaunchService";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { log, logError, logWarn } from '../utils/logger';

export const SignupScreen = ({ navigation, route }) => {
  // Get user data from previous screens
  const userData = route.params || {};
  
  log('🔍 SignupScreen - Received userData:', JSON.stringify(userData, null, 2));
  
  const [errorState, setErrorState] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    passwordVisibility,
    handlePasswordVisibility,
    rightIcon,
    handleConfirmPasswordVisibility,
    confirmPasswordIcon,
    confirmPasswordVisibility,
  } = useTogglePasswordVisibility();



  const handleOnSignUp = async (values, actions) => {
    const { email, password } = values;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      log('User created successfully:', user.uid);
      
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
      
      log('💾 SignupScreen - Data to save:', JSON.stringify(userDataToSave, null, 2));
      log('✅ Profile completed will be set to:', userDataToSave.profileCompleted);
      
      try {
        await setDoc(doc(db, 'users', user.uid), userDataToSave);
        log('Complete user profile saved to Firestore:', userDataToSave);
      } catch (firestoreError) {
        log('Firestore error (user still created):', firestoreError);
        // Still save basic data
        await setDoc(doc(db, 'users', user.uid), userDataToSave, { merge: true });
      }
      
      // Mark onboarding as completed
      await FirstLaunchService.markOnboardingCompleted();
      await FirstLaunchService.markAsLaunched();
      
      log('Signup and profile setup completed successfully');
      
      // User will be automatically navigated to HomeScreen by the auth state change
    } catch (error) {
      log('Signup error:', error.message);
      actions.setFieldError('general', error.message);
    }
  };

  // Render scroll view content
  const renderContent = () => (
    <>
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
    </>
  );

  return (
    <View isSafe style={styles.container}>
      <AlphaBadge style={styles.alphaBadge} />
      {Platform.OS === 'ios' ? (
        <KeyboardAwareScrollView enableOnAndroid={true}>
          {renderContent()}
        </KeyboardAwareScrollView>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled">
          {renderContent()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    position: 'relative',
  },
  alphaBadge: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
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
