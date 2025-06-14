import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function ProfileSummaryScreen({ navigation, route }) {
  const { email, gender, age, height, weight, goal } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Numa 👋</Text>
      <Text style={styles.subtitle}>Your health journey starts here.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Profile</Text>
        <Text style={styles.item}>Email: {email || '-'}</Text>
        <Text style={styles.item}>Gender: {gender || '-'}</Text>
        <Text style={styles.item}>Age: {age || '-'} years</Text>
        <Text style={styles.item}>Height: {height || '-'} cm</Text>
        <Text style={styles.item}>Weight: {weight || '-'} kg</Text>
        <Text style={styles.item}>Goal: {goal || '-'}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Start Tracking</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  item: {
    fontSize: 16,
    paddingVertical: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
}); 