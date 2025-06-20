import React, { useState, useEffect } from "react";
import { Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from 'firebase/auth';

import { View, TextInput, Logo, Button, FormErrorMessage } from "../components";
import { Images, Colors, auth } from "../config";
import { useTogglePasswordVisibility } from "../hooks";
import { loginValidationSchema } from "../utils";
import { BiometricService } from "../services/BiometricService";

export const LoginScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  
  const {
    passwordVisibility,
    handlePasswordVisibility,
    rightIcon,
    handleConfirmPasswordVisibility,
    confirmPasswordIcon,
    confirmPasswordVisibility
  } = useTogglePasswordVisibility();

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const isEnabled = await BiometricService.isBiometricEnabled();
    const typeName = await BiometricService.getBiometricTypeName();
    setBiometricEnabled(isEnabled);
    setBiometricType(typeName);
  };

  const handleLogin = async (values) => {
    const { email, password } = values;

    setErrorState('');
    setIsLoading(true);

    try {
      console.log('Attempting login with email:', email);
      await signInWithEmailAndPassword(auth, email, password);
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

  const handleBiometricLogin = async () => {
    try {
      const credentials = await BiometricService.getCredentials();
      if (credentials) {
        await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      } else {
        Alert.alert('No biometric credentials found', 'Please log in with email and password first.');
      }
    } catch (error) {
      Alert.alert('Biometric authentication failed', error.message);
    }
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'Face ID':
        return 'face-recognition';
      case 'Touch ID':
        return 'fingerprint';
      default:
        return 'shield-check';
    }
  };
  
  return (
    <>
      <View isSafe style={styles.container}>
        <KeyboardAwareScrollView enableOnAndroid={true}>
          {/* LogoContainer: consist app logo and screen title */}
          <View style={styles.logoContainer}>
            <Logo uri={Images.logo} />
            <Text style={styles.screenTitle}>Welcome back!</Text>
          </View>
          
          {/* Biometric Login Button */}
          {biometricEnabled && (
            <View style={styles.biometricContainer}>
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={isLoading}
              >
                <MaterialCommunityIcons 
                  name={getBiometricIcon()} 
                  size={24} 
                  color={Colors.orange} 
                />
                <Text style={styles.biometricText}>
                  Sign in with {biometricType}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
            </View>
          )}
          
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
                  autoFocus={!biometricEnabled}
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
            title={"Create a new account?"}
            onPress={() => navigation.navigate("Welcome")}
          />
          <Button
            style={styles.borderlessButtonContainer}
            borderless
            title={"Forgot Password"}
            onPress={() => navigation.navigate("ForgotPassword")}
          />
        </KeyboardAwareScrollView>
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
  biometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B4EFF10',
    borderWidth: 1,
    borderColor: '#6B4EFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.orange + '10',
    borderWidth: 1,
    borderColor: Colors.orange,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  biometricText: {
    marginLeft: 8,
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lightGrey,
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: Colors.darkgrey,
    fontWeight: '500',
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
    color: Colors.orange,
  },
  button: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: "700",
  },
  borderlessButtonContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  }
});
