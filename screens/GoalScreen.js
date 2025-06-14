import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config';
import { Button } from '../components';

export const GoalScreen = ({ navigation, route }) => {
  const userInfo = route.params || {};
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleContinue = () => {
    if (selectedGoal) {
      // Combine all user data
      const userData = {
        ...userInfo,
        goal: selectedGoal
      };
      
      console.log('=== GOAL SCREEN DEBUG ===');
      console.log('User info received:', JSON.stringify(userInfo, null, 2));
      console.log('Selected goal:', selectedGoal);
      console.log('Final user data to pass:', JSON.stringify(userData, null, 2));
      
      // Navigate to sign up with all the collected user data
      navigation.navigate('Signup', userData);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your goal?</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              selectedGoal === 'reduce' && styles.selectedOption
            ]}
            onPress={() => setSelectedGoal('reduce')}
          >
            <Text style={styles.optionTitle}>Reduce</Text>
            <Text style={styles.optionDescription}>
              I want to lose weight and improve my health
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.option,
              selectedGoal === 'maintain' && styles.selectedOption
            ]}
            onPress={() => setSelectedGoal('maintain')}
          >
            <Text style={styles.optionTitle}>Maintain</Text>
            <Text style={styles.optionDescription}>
              I want to maintain my current weight and focus on health
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.option,
              selectedGoal === 'increase' && styles.selectedOption
            ]}
            onPress={() => setSelectedGoal('increase')}
          >
            <Text style={styles.optionTitle}>Increase</Text>
            <Text style={styles.optionDescription}>
              I want to gain weight and build muscle
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          style={[
            styles.button, 
            !selectedGoal && styles.disabledButton
          ]} 
          onPress={handleContinue}
          disabled={!selectedGoal}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 40,
    textAlign: 'center'
  },
  optionsContainer: {
    width: '100%',
    gap: 16
  },
  option: {
    backgroundColor: Colors.lightGrey + '30',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.lightGrey
  },
  selectedOption: {
    backgroundColor: Colors.orange + '20',
    borderColor: Colors.orange
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.darkgrey
  },
  buttonContainer: {
    marginTop: 40
  },
  button: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: Colors.orange + '80'
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600'
  }
}); 