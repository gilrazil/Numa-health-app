import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config';
import { Button } from '../components';
import { t, getCurrentLanguageInfo } from '../config/i18n';

export const AgeHeightWeightScreen = ({ navigation, route }) => {
  const { gender } = route.params || {};
  const { isRTL } = getCurrentLanguageInfo();
  
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const isFormValid = age !== '' && height !== '' && weight !== '';

  const handleContinue = () => {
    if (isFormValid) {
      const dataToPass = { 
        gender,
        age: parseInt(age),
        height: parseInt(height),
        weight: parseInt(weight)
      };
      
      console.log('=== AGE/HEIGHT/WEIGHT SCREEN DEBUG ===');
      console.log('Gender received:', gender);
      console.log('Form values - Age:', age, 'Height:', height, 'Weight:', weight);
      console.log('Data to pass to Goal screen:', JSON.stringify(dataToPass, null, 2));
      
      navigation.navigate('Goal', dataToPass);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isRTL && styles.rtlContainer]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, isRTL && styles.rtlText]}>
            {t('profile.title')}
          </Text>
          <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
            {t('profile.subtitle')}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, isRTL && styles.rtlText]}>
              {t('profile.age')}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.rtlInput]}
              placeholder={t('profile.ageYears')}
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              maxLength={3}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, isRTL && styles.rtlText]}>
              {t('profile.height')}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.rtlInput]}
              placeholder={t('profile.heightCm')}
              keyboardType="number-pad"
              value={height}
              onChangeText={setHeight}
              maxLength={3}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, isRTL && styles.rtlText]}>
              {t('profile.weight')}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.rtlInput]}
              placeholder={t('profile.weightKg')}
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
              <Text style={[styles.buttonText, isRTL && styles.rtlText]}>
                {t('profile.continue')}
              </Text>
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
  rtlContainer: {
    direction: 'rtl'
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
    marginBottom: 16,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: Colors.darkgrey,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22
  },
  rtlText: {
    textAlign: 'center',
    writingDirection: 'rtl'
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
  rtlInput: {
    textAlign: 'right'
  },
  buttonContainer: {
    marginTop: 30
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