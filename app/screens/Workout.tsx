import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Workout() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Plans Page</Text>
      <Text>This is where the user's workout plans will be displayed.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});