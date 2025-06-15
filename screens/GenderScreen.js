import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config';
import { Button } from '../components';
import { t, getCurrentLanguageInfo } from '../config/i18n';

export const GenderScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState(null);
  const { isRTL } = getCurrentLanguageInfo();

  const handleContinue = () => {
    if (selectedGender) {
      // Store gender in context or pass to next screen
      navigation.navigate('AgeHeightWeight', { gender: selectedGender });
    }
  };

  return (
    <SafeAreaView style={[styles.container, isRTL && styles.rtlContainer]}>
      <View style={styles.content}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          {t('gender.title')}
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
          {t('gender.subtitle')}
        </Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === 'male' && styles.selectedOption
            ]}
            onPress={() => setSelectedGender('male')}
          >
            <Text 
              style={[
                styles.optionText, 
                selectedGender === 'male' && styles.selectedOptionText,
                isRTL && styles.rtlText
              ]}
            >
              {t('gender.male')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === 'female' && styles.selectedOption
            ]}
            onPress={() => setSelectedGender('female')}
          >
            <Text 
              style={[
                styles.optionText, 
                selectedGender === 'female' && styles.selectedOptionText,
                isRTL && styles.rtlText
              ]}
            >
              {t('gender.female')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === 'other' && styles.selectedOption
            ]}
            onPress={() => setSelectedGender('other')}
          >
            <Text 
              style={[
                styles.optionText, 
                selectedGender === 'other' && styles.selectedOptionText,
                isRTL && styles.rtlText
              ]}
            >
              {t('gender.other')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          style={[
            styles.button, 
            !selectedGender && styles.disabledButton
          ]} 
          onPress={handleContinue}
          disabled={!selectedGender}
        >
          <Text style={[styles.buttonText, isRTL && styles.rtlText]}>
            {t('gender.continue')}
          </Text>
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
  rtlContainer: {
    direction: 'rtl'
  },
  content: {
    flex: 1,
    justifyContent: 'center'
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
  optionsContainer: {
    width: '100%',
    gap: 16
  },
  option: {
    backgroundColor: Colors.lightGrey,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGrey
  },
  selectedOption: {
    backgroundColor: Colors.orange + '20',
    borderColor: Colors.orange
  },
  optionText: {
    fontSize: 18,
    color: Colors.darkgrey,
    fontWeight: '500'
  },
  selectedOptionText: {
    color: Colors.orange,
    fontWeight: '600'
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