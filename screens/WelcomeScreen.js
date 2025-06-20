import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config';
import { Button } from '../components';

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
        <Button 
          style={styles.button} 
          onPress={() => navigation.navigate('Gender')}
        >
          <Text style={styles.buttonText}>Let's get started</Text>
        </Button>
        
        <Button 
          style={styles.secondaryButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
        </Button>
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
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B4EFF'
  },
  secondaryButtonText: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '500'
  }
}); 