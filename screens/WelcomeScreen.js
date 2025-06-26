import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config';
import { AlphaBadge } from '../components';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Section with Logo and Tagline */}
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/numa-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Track your meals.</Text>
          <Text style={styles.tagline}>Achieve your goals.</Text>
          <AlphaBadge style={styles.alphaBadge} />
        </View>
      </View>
      
      {/* Middle Spacer */}
      <View style={styles.spacer} />
      
      {/* Bottom Section with Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Gender')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    position: 'relative',
  },
  alphaBadge: {
    marginTop: 20,
    alignSelf: 'center',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: Math.min(screenWidth * 0.35, 140),
    height: Math.min(screenWidth * 0.35, 140),
    maxWidth: screenWidth * 0.4,
    maxHeight: screenHeight * 0.2,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: Math.min(screenWidth * 0.055, 22),
    color: Colors.black,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: Math.min(screenWidth * 0.065, 26),
  },
  spacer: {
    flex: screenHeight < 700 ? 0.2 : 0.3,
    minHeight: 20,
  },
  buttonContainer: {
    paddingBottom: 30,
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: '#6B4EFF',
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.24,
  },
  secondaryButton: {
    backgroundColor: Colors.primaryBackground,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.24,
  }
}); 