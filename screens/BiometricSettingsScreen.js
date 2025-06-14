import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../config';
import { Button } from '../components';
import { BiometricService } from '../services/BiometricService';

export const BiometricSettingsScreen = ({ navigation }) => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      const [enabled, available, typeName] = await Promise.all([
        BiometricService.isBiometricEnabled(),
        BiometricService.isBiometricAvailable(),
        BiometricService.getBiometricTypeName()
      ]);

      setBiometricEnabled(enabled);
      setBiometricAvailable(available.isAvailable);
      setBiometricType(typeName);
    } catch (error) {
      console.error('Error checking biometric status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBiometric = async (value) => {
    if (isToggling) return;
    
    setIsToggling(true);

    try {
      if (value) {
        // Enable biometric
        Alert.prompt(
          'Enable Biometric Login',
          'Please enter your password to enable biometric authentication:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async (password) => {
                if (!password) {
                  setIsToggling(false);
                  return;
                }

                // Get user email (you might want to store this in context or get from Firebase)
                const user = auth.currentUser;
                if (!user) {
                  Alert.alert('Error', 'User not found');
                  setIsToggling(false);
                  return;
                }

                try {
                  // Test authentication first
                  const authResult = await BiometricService.authenticateWithBiometrics(
                    `Set up ${biometricType} for quick sign-in`
                  );

                  if (authResult.success) {
                    const success = await BiometricService.enableBiometricLogin(
                      user.email,
                      password
                    );

                    if (success) {
                      setBiometricEnabled(true);
                      Alert.alert('Success', `${biometricType} has been enabled for quick sign-in.`);
                    } else {
                      Alert.alert('Error', 'Failed to enable biometric authentication.');
                    }
                  } else if (authResult.error !== 'UserCancel') {
                    Alert.alert('Error', authResult.error || 'Biometric authentication failed.');
                  }
                } catch (error) {
                  console.error('Error enabling biometric:', error);
                  Alert.alert('Error', 'Failed to enable biometric authentication.');
                }
              }
            }
          ],
          'secure-text'
        );
      } else {
        // Disable biometric
        Alert.alert(
          'Disable Biometric Login',
          `Are you sure you want to disable ${biometricType} login?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                const success = await BiometricService.disableBiometricLogin();
                if (success) {
                  setBiometricEnabled(false);
                  Alert.alert('Disabled', `${biometricType} login has been disabled.`);
                } else {
                  Alert.alert('Error', 'Failed to disable biometric authentication.');
                }
              }
            }
          ]
        );
      }
    } finally {
      setIsToggling(false);
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.black} />
        </Button>
        <Text style={styles.title}>Security Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <MaterialCommunityIcons 
              name={getBiometricIcon()} 
              size={32} 
              color={Colors.orange} 
            />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{biometricType} Login</Text>
              <Text style={styles.settingDescription}>
                {biometricAvailable 
                  ? `Use ${biometricType} for quick and secure sign-in`
                  : `${biometricType} is not available on this device`
                }
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              disabled={!biometricAvailable || isToggling}
              trackColor={{ false: Colors.lightGrey, true: Colors.orange + '50' }}
              thumbColor={biometricEnabled ? Colors.orange : Colors.white}
            />
          </View>
        </View>

        {!biometricAvailable && (
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information" size={20} color={Colors.orange} />
            <Text style={styles.infoText}>
              To use biometric authentication, please set up {biometricType} in your device settings.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 15,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.darkgrey,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.orange + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: Colors.darkgrey,
    lineHeight: 20,
  },
}); 