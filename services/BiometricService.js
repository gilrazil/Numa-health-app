import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { log, logError, logWarn } from '../utils/logger';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const USER_CREDENTIALS_KEY = 'user_credentials';

export class BiometricService {
  // Check if biometric authentication is available on the device
  static async isBiometricAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return {
        isAvailable: hasHardware && isEnrolled,
        hasHardware,
        isEnrolled,
        supportedTypes
      };
    } catch (error) {
      logError('Error checking biometric availability:', error);
      return { isAvailable: false, hasHardware: false, isEnrolled: false, supportedTypes: [] };
    }
  }

  // Get the biometric type name for display
  static async getBiometricTypeName() {
    try {
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Touch ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      }
      
      return 'Biometric';
    } catch (error) {
      logError('Error getting biometric type:', error);
      return 'Biometric';
    }
  }

  // Authenticate using biometrics
  static async authenticateWithBiometrics(promptMessage = 'Authenticate to continue') {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      return result;
    } catch (error) {
      logError('Biometric authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has enabled biometric login
  static async isBiometricEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      logError('Error checking biometric enabled status:', error);
      return false;
    }
  }

  // Enable biometric login and store credentials securely
  static async enableBiometricLogin(email, password) {
    try {
      // Store credentials securely
      const credentials = JSON.stringify({ email, password });
      await SecureStore.setItemAsync(USER_CREDENTIALS_KEY, credentials);
      
      // Mark biometric as enabled
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      
      return true;
    } catch (error) {
      logError('Error enabling biometric login:', error);
      return false;
    }
  }

  // Disable biometric login and remove stored credentials
  static async disableBiometricLogin() {
    try {
      await SecureStore.deleteItemAsync(USER_CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      return true;
    } catch (error) {
      logError('Error disabling biometric login:', error);
      return false;
    }
  }

  // Get stored credentials after successful biometric authentication
  static async getStoredCredentials() {
    try {
      const credentials = await SecureStore.getItemAsync(USER_CREDENTIALS_KEY);
      if (credentials) {
        return JSON.parse(credentials);
      }
      return null;
    } catch (error) {
      logError('Error getting stored credentials:', error);
      return null;
    }
  }

  // Complete biometric login flow
  static async loginWithBiometrics() {
    try {
      const biometricTypeName = await this.getBiometricTypeName();
      const authResult = await this.authenticateWithBiometrics(
        `Use ${biometricTypeName} to sign in`
      );

      if (authResult.success) {
        const credentials = await this.getStoredCredentials();
        return { success: true, credentials };
      } else {
        return { success: false, error: authResult.error };
      }
    } catch (error) {
      logError('Biometric login error:', error);
      return { success: false, error: error.message };
    }
  }
} 