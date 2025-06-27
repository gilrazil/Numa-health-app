import React, { useState, useEffect } from "react";
import { Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from "react-native";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from 'firebase/auth';

import { View, TextInput, Logo, Button, FormErrorMessage, AlphaBadge } from "../components";
import { Images, Colors, auth } from "../config";
import { useTogglePasswordVisibility } from "../hooks";
import { loginValidationSchema } from "../utils";
import { FirstLaunchService } from "../services/FirstLaunchService";

export const LoginScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    passwordVisibility,
    handlePasswordVisibility,
    rightIcon,
    handleConfirmPasswordVisibility,
    confirmPasswordIcon,
    confirmPasswordVisibility
  } = useTogglePasswordVisibility();



  const handleLogin = async (values) => {
    const { email, password } = values;

    setErrorState('');
    setIsLoading(true);

    // Handle empty email gracefully
    if (!email.trim()) {
      setErrorState('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting login with email:', email);
      await signInWithEmailAndPassword(auth, email, password);
      
      // Mark app as launched since user successfully logged in
      await FirstLaunchService.markAsLaunched();
      
      console.log('Login successful!');
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      
      // Provide more user-friendly error messages
      switch (error.code) {
        case 'auth/invalid-login-credentials':
          setErrorState('Invalid email or password. Please check your credentials and try again.');
          break;
        case 'auth/user-not-found':
          setErrorState('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          setErrorState('Incorrect password.');
          break;
        case 'auth/invalid-email':
          setErrorState('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          setErrorState('This account has been disabled.');
          break;
        case 'auth/too-many-requests':
          setErrorState('Too many failed attempts. Please try again later.');
          break;
        default:
          setErrorState(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render scroll view content
  const renderContent = () => (
    <>
      {/* LogoContainer: consist app logo and screen title */}
      <View style={styles.logoContainer}>
        <Logo uri={Images.logo} />
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Welcome back!</Text>
          <AlphaBadge style={styles.alphaBadge} />
        </View>
      </View>
      

      
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={loginValidationSchema}
        onSubmit={(values) => handleLogin(values)}
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
            <FormErrorMessage
              error={errors.email}
              visible={touched.email}
            />
            <TextInput
              name="password"
              leftIconName="key-variant"
              placeholder="Enter password"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={passwordVisibility}
              textContentType="password"
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
            {/* Display Screen Error Messages */}
            {errorState !== "" ? (
              <FormErrorMessage error={errorState} visible={true} />
            ) : null}
            {/* Login button */}
            <Button style={styles.button} onPress={handleSubmit} disabled={isLoading}>
              <Text style={styles.buttonText}>
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </Button>
          </>
        )}
      </Formik>
      
      {/* Button to navigate to SignupScreen to create a new account */}
      <Button
        style={styles.borderlessButtonContainer}
        borderless
        title={"New user? Get started"}
        onPress={() => navigation.navigate("Welcome")}
      />
      <Button
        style={styles.borderlessButtonContainer}
        borderless
        title={"Forgot Password"}
        onPress={() => navigation.navigate("ForgotPassword")}
      />
    </>
  );
  
  return (
    <>
      <View isSafe style={styles.container}>
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

      {/* App info footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Numa Health App</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    position: 'relative',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  alphaBadge: {
    marginTop: 2,
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

  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingBottom: 48,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
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
    fontSize: 20,
    color: '#ffffff', // Explicit white color
    fontWeight: "700",
  },
  borderlessButtonContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  }
});
