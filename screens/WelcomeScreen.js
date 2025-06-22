import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config';

export const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/numa-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Track your meals.</Text>
          <Text style={styles.tagline}>Achieve your goals.</Text>
        </View>
      </View>
      
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
    paddingHorizontal: 25,
    justifyContent: 'space-between',
    paddingVertical: 50
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  tagline: {
    fontSize: 24,
    color: Colors.black,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8
  },
  buttonContainer: {
    marginBottom: 30
  },
  button: {
    backgroundColor: '#6B4EFF', // Explicit purple color
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    // Add gradient-like effect with border
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  buttonText: {
    color: '#ffffff', // Explicit white color
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
  },
  secondaryButton: {
    backgroundColor: Colors.primaryBackground,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3
  }
}); 