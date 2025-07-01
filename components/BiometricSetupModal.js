import React, { useState, useEffect } from 'react';
import {
import { log, logError, logWarn } from '../utils/logger';
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../config';
import { Button } from './Button';
import { BiometricService } from '../services/BiometricService';

export const BiometricSetupModal = ({ 
  visible, 
  onClose, 
  onSetupComplete,
  userCredentials 
}) => {
  const [biometricType, setBiometricType] = useState('Biometric');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      getBiometricType();
    }
  }, [visible]);

  const getBiometricType = async () => {
    const typeName = await BiometricService.getBiometricTypeName();
    setBiometricType(typeName);
  };

  const handleSetupBiometric = async () => {
    setIsLoading(true);
    
    try {
      // First, test biometric authentication
      const authResult = await BiometricService.authenticateWithBiometrics(
        `Set up ${biometricType} for quick sign-in`
      );

      if (authResult.success) {
        // If authentication successful, enable biometric login
        const setupSuccess = await BiometricService.enableBiometricLogin(
          userCredentials.email,
          userCredentials.password
        );

        if (setupSuccess) {
          Alert.alert(
            'Success!',
            `${biometricType} has been set up for quick sign-in.`,
            [{ text: 'OK', onPress: () => {
              onSetupComplete(true);
              onClose();
            }}]
          );
        } else {
          Alert.alert('Error', 'Failed to set up biometric authentication.');
        }
      } else if (authResult.error !== 'UserCancel') {
        Alert.alert('Error', authResult.error || 'Biometric authentication failed.');
      }
    } catch (error) {
      logError('Biometric setup error:', error);
      Alert.alert('Error', 'Failed to set up biometric authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onSetupComplete(false);
    onClose();
  };

  const getIconName = () => {
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={getIconName()} 
              size={60} 
              color={Colors.orange} 
            />
          </View>
          
          <Text style={styles.title}>
            Set up {biometricType}
          </Text>
          
          <Text style={styles.description}>
            Use {biometricType} for quick and secure sign-in to your Numa account.
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button 
              style={styles.setupButton}
              onPress={handleSetupBiometric}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.setupButtonText}>
                  Set up {biometricType}
                </Text>
              )}
            </Button>
            
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.darkgrey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
  },
  setupButton: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  setupButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: Colors.darkgrey,
    fontSize: 16,
    fontWeight: '500',
  },
}); 