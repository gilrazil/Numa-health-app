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
import { FirstLaunchService } from "../services/FirstLaunchService";

export const LoginScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
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

  // Auto-trigger biometric authentication when screen loads for biometric users
  useEffect(() => {
    if (biometricEnabled && biometricAvailable && !isLoading) {
      const timer = setTimeout(() => {
        handleBiometricLogin();
      }, 1000); // Small delay for better UX

      return () => clearTimeout(timer);
    }
  }, [biometricEnabled, biometricAvailable, isLoading]);

  const checkBiometricStatus = async () => {
    const isEnabled = await BiometricService.isBiometricEnabled();
    const biometricInfo = await BiometricService.isBiometricAvailable();
    const typeName = await BiometricService.getBiometricTypeName();
    
    setBiometricEnabled(isEnabled);
    setBiometricAvailable(biometricInfo.isAvailable);
    setBiometricType(typeName);
    
    console.log('Biometric status:', { isEnabled, isAvailable: biometricInfo.isAvailable, typeName });
  };

  const handleLogin = async (values) => {
    const { email, password } = values;

    setErrorState('');
    setIsLoading(true);

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

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      setErrorState('');

      // If biometric is not enabled, show a message and return
      if (!biometricEnabled) {
        Alert.alert(
          'Biometric Login Not Set Up',
          'To use biometric login, please log in with your email and password first. You can then enable biometric login in your profile settings.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      const result = await BiometricService.loginWithBiometrics();
      
      if (result.success && result.credentials) {
        console.log('✅ Biometric authentication successful');
        
        // Sign in with Firebase
        await signInWithEmailAndPassword(
          auth, 
          result.credentials.email, 
          result.credentials.password
        );
        
        // Mark app as launched
        await FirstLaunchService.markAsLaunched();
        
        console.log('🎉 Biometric login successful!');
      } else if (result.error && result.error !== 'UserCancel') {
        setErrorState(`Biometric authentication failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      if (!error.message.includes('UserCancel')) {
        setErrorState(`Authentication failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
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
          
          {/* Apple-style Face ID Button */}
          {biometricAvailable && (
            <View style={styles.biometricSection}>
              <TouchableOpacity
                style={[
                  styles.faceIdButton,
                  biometricEnabled ? styles.faceIdButtonEnabled : styles.faceIdButtonDisabled
                ]}
                onPress={handleBiometricLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.faceIdIconContainer,
                  biometricEnabled ? styles.faceIdIconEnabled : styles.faceIdIconDisabled
                ]}>
                  <MaterialCommunityIcons 
                    name={getBiometricIcon()} 
                    size={28} 
                    color={biometricEnabled ? '#FFFFFF' : '#6B4EFF'} 
                  />
                </View>
                <View style={styles.faceIdTextContainer}>
                  <Text style={[
                    styles.faceIdMainText,
                    biometricEnabled ? styles.faceIdMainTextEnabled : styles.faceIdMainTextDisabled
                  ]}>
                    {biometricType}
                  </Text>
                  <Text style={[
                    styles.faceIdSubText,
                    biometricEnabled ? styles.faceIdSubTextEnabled : styles.faceIdSubTextDisabled
                  ]}>
                    {biometricEnabled ? 'Touch to sign in' : 'Set up after first login'}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
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
            title={"New user? Get started"}
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
  biometricSection: {
    marginBottom: 25,
    marginTop: 10,
  },
  faceIdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  faceIdButtonEnabled: {
    backgroundColor: '#6B4EFF',
    shadowColor: '#6B4EFF',
    shadowOpacity: 0.25,
    borderWidth: 0,
  },
  faceIdButtonDisabled: {
    backgroundColor: '#F8F9FB',
    borderWidth: 1.5,
    borderColor: '#E1E4E8',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
  },
  faceIdIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  faceIdIconEnabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  faceIdIconDisabled: {
    backgroundColor: '#F0EDFF',
  },
  faceIdTextContainer: {
    flex: 1,
  },
  faceIdMainText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.24,
    marginBottom: 2,
  },
  faceIdMainTextEnabled: {
    color: '#FFFFFF',
  },
  faceIdMainTextDisabled: {
    color: '#1D1D1F',
  },
  faceIdSubText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.08,
  },
  faceIdSubTextEnabled: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  faceIdSubTextDisabled: {
    color: '#86868B',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E4E8',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#86868B',
    fontWeight: '400',
    letterSpacing: -0.08,
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
