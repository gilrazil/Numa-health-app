import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AlphaBadge } from '../components';

export const GenderScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState(null);

  const handleContinue = () => {
    if (selectedGender) {
      // Store gender in context or pass to next screen
      navigation.navigate('AgeHeightWeight', { gender: selectedGender });
    }
  };

  const renderGenderOption = (gender, label, icon) => (
    <TouchableOpacity
      style={[
        styles.option,
        selectedGender === gender && styles.selectedOption
      ]}
      onPress={() => setSelectedGender(gender)}
    >
      <View style={styles.optionContent}>
        <MaterialCommunityIcons 
          name={icon} 
          size={32} 
          color={selectedGender === gender ? '#6B4EFF' : Colors.darkgrey} 
        />
        <Text style={[
          styles.optionText,
          selectedGender === gender && styles.selectedOptionText
        ]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>What's your gender?</Text>
        <AlphaBadge style={styles.alphaBadge} />
      </View>
      
      <View style={styles.optionsContainer}>
        {renderGenderOption('male', 'Male', 'gender-male')}
        {renderGenderOption('female', 'Female', 'gender-female')}
        {renderGenderOption('other', 'Other', 'gender-non-binary')}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.button,
            !selectedGender && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedGender}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
    paddingVertical: 40,
    position: 'relative',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  alphaBadge: {
    marginTop: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center'
  },
  optionsContainer: {
    gap: 16
  },
  option: {
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 12,
    padding: 20,
    backgroundColor: Colors.white
  },
  selectedOption: {
    backgroundColor: '#6B4EFF20',
    borderColor: '#6B4EFF'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  optionText: {
    fontSize: 18,
    color: Colors.darkgrey,
    fontWeight: '500'
  },
  selectedOptionText: {
    color: '#6B4EFF',
    fontWeight: '600'
  },
  buttonContainer: {
    marginTop: 40
  },
  button: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#6B4EFF80'
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600'
  }
}); 