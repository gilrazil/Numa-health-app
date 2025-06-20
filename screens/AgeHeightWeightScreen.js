import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config';
import { Button } from '../components';

export const AgeHeightWeightScreen = ({ navigation, route }) => {
  const { gender } = route.params || {};
  
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isMetric, setIsMetric] = useState(true);

  const isFormValid = age !== '' && height !== '' && weight !== '';

  const handleContinue = () => {
    if (isFormValid) {
      // Convert to metric if using US units
      const heightInCm = isMetric ? parseInt(height) : Math.round(parseInt(height) * 2.54);
      const weightInKg = isMetric ? parseInt(weight) : Math.round(parseInt(weight) * 0.453592);

      const dataToPass = { 
        gender,
        age: parseInt(age),
        height: heightInCm,
        weight: weightInKg,
        preferredUnit: isMetric ? 'metric' : 'us'
      };
      
      console.log('=== AGE/HEIGHT/WEIGHT SCREEN DEBUG ===');
      console.log('Gender received:', gender);
      console.log('Form values - Age:', age, 'Height:', height, 'Weight:', weight);
      console.log('Data to pass to Goal screen:', JSON.stringify(dataToPass, null, 2));
      
      navigation.navigate('Goal', dataToPass);
    }
  };

  const toggleUnitSystem = () => {
    setIsMetric(!isMetric);
    // Convert values when switching units
    if (height) {
      setHeight(isMetric 
        ? Math.round(parseInt(height) / 2.54).toString() 
        : Math.round(parseInt(height) * 2.54).toString()
      );
    }
    if (weight) {
      setWeight(isMetric 
        ? Math.round(parseInt(weight) / 0.453592).toString() 
        : Math.round(parseInt(weight) * 0.453592).toString()
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Tell us about yourself</Text>
          
          <View style={styles.unitToggleContainer}>
            <TouchableOpacity 
              style={[styles.unitToggle, isMetric && styles.unitToggleActive]} 
              onPress={() => !isMetric && toggleUnitSystem()}
            >
              <Text style={[styles.unitToggleText, isMetric && styles.unitToggleTextActive]}>
                Metric
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.unitToggle, !isMetric && styles.unitToggleActive]} 
              onPress={() => isMetric && toggleUnitSystem()}
            >
              <Text style={[styles.unitToggleText, !isMetric && styles.unitToggleTextActive]}>
                US
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Years"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              maxLength={3}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Height</Text>
            <TextInput
              style={styles.input}
              placeholder={isMetric ? "cm" : "inches"}
              keyboardType="number-pad"
              value={height}
              onChangeText={setHeight}
              maxLength={3}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.input}
              placeholder={isMetric ? "kg" : "lbs"}
              keyboardType="number-pad"
              value={weight}
              onChangeText={setWeight}
              maxLength={3}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              style={[
                styles.button, 
                !isFormValid && styles.disabledButton
              ]} 
              onPress={handleContinue}
              disabled={!isFormValid}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingVertical: 40,
    flexGrow: 1
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 20,
    textAlign: 'center'
  },
  unitToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGrey + '40',
    borderRadius: 12,
    padding: 4,
    marginBottom: 40,
    alignSelf: 'center',
    width: '60%'
  },
  unitToggle: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  unitToggleActive: {
    backgroundColor: '#6B4EFF'
  },
  unitToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black
  },
  unitToggleTextActive: {
    color: Colors.white
  },
  inputContainer: {
    marginBottom: 24
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    marginBottom: 8
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.black
  },
  buttonContainer: {
    marginTop: 30
  },
  button: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#6B4EFF' + '80'
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600'
  }
}); 