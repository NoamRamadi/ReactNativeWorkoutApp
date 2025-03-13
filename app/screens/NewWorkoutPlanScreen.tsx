import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NewWorkoutPlanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Workout Plan</Text>
      <Text>This is where you can create and save a new workout plan.</Text>
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