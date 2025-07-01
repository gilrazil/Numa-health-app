import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Colors, auth } from '../config';
import { BiometricService } from '../services/BiometricService';
import { FirstLaunchService } from '../services/FirstLaunchService';
import { Logo } from '../components';
import { Images } from '../config';
import { log, logError, logWarn } from '../utils/logger';

export const AutoBiometricScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [biometricType, setBiometricType] = useState('Face ID');
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeBiometricLogin();
  }, []);

  const initializeBiometricLogin = async () => {
    try {
      // Get biometric type for better UX
      const typeName = await BiometricService.getBiometricTypeName();
      setBiometricType(typeName);

      // Small delay for smooth UX
      setTimeout(() => {
        attemptBiometricLogin();
      }, 500);
    } catch (error) {
      logError('Error initializing biometric login:', error);
      setShowManualLogin(true);
      setIsLoading(false);
    }
  };

  const attemptBiometricLogin = async () => {
    try {
      setError('');
      setIsLoading(true);

      log('🔐 Attempting automatic biometric login...');
      
      const result = await BiometricService.loginWithBiometrics();
      
      if (result.success && result.credentials) {
        log('✅ Biometric authentication successful');
        
        // Sign in with Firebase
        await signInWithEmailAndPassword(
          auth, 
          result.credentials.email, 
          result.credentials.password
        );
        
        // Mark as launched
        await FirstLaunchService.markAsLaunched();
        
        log('🎉 Auto-login successful!');
        // Navigation will be handled by RootNavigator auth state change
      } else {
        // Biometric failed or cancelled
        log('❌ Biometric authentication failed:', result.error);
        
        if (result.error === 'UserCancel') {
          setShowManualLogin(true);
        } else {
          setError(result.error || 'Authentication failed');
          setShowManualLogin(true);
        }
      }
    } catch (error) {
      logError('Auto biometric login error:', error);
      setError(error.message);
      setShowManualLogin(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryBiometric = () => {
    setShowManualLogin(false);
    setError('');
    attemptBiometricLogin();
  };

  const handleManualLogin = () => {
    navigation.navigate('Login');
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

  const getBiometricAnimation = () => {
    // You could add a pulsing animation here
    return biometricType === 'Face ID' ? 'face-recognition' : 'fingerprint';
  };

  if (isLoading && !showManualLogin) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Logo uri={Images.logo} />
          
          <View style={styles.biometricContainer}>
            <MaterialCommunityIcons 
              name={getBiometricAnimation()} 
              size={80} 
                          color={Colors.primary}
            style={styles.biometricIcon}
            />
            
            <Text style={styles.title}>
              {biometricType === 'Face ID' ? 'Looking for your face...' : 'Waiting for fingerprint...'}
            </Text>
            
            <Text style={styles.subtitle}>
              {biometricType === 'Face ID' 
                ? 'Position your face in front of the camera' 
                : 'Place your finger on the sensor'
              }
            </Text>
            
            <ActivityIndicator 
              size="large" 
              color={Colors.primary} 
              style={styles.loader}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Logo uri={Images.logo} />
        
        <View style={styles.biometricContainer}>
          <MaterialCommunityIcons 
            name={getBiometricIcon()} 
            size={80} 
            color={error ? Colors.red : Colors.primary}
          />
          
          <Text style={styles.title}>
            {error ? 'Authentication Failed' : `Welcome back!`}
          </Text>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <Text style={styles.subtitle}>
            {error 
              ? 'Please try again or use manual login' 
              : `Use ${biometricType} to continue`
            }
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleRetryBiometric}
          >
            <MaterialCommunityIcons 
              name={getBiometricIcon()} 
              size={24} 
              color={Colors.white}
            />
            <Text style={styles.primaryButtonText}>
              Try {biometricType} Again
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleManualLogin}
          >
            <Text style={styles.secondaryButtonText}>
              Use Email & Password
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  biometricContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  biometricIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.darkgrey,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: Colors.red,
    textAlign: 'center',
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
  },
  secondaryButtonText: {
    color: Colors.darkgrey,
    fontSize: 16,
    fontWeight: '500',
  },
}); 