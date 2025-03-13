import { useNavigation } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function NewWorkoutPlanScreen() {
    // Navigate to the SelectExerciseScreen


    const navigation = useNavigation();
    const handleAddExercise = () => {
        navigation.navigate('SelectExercise');
      };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Workout Plan</Text>
      <Text>This is where you can create and save a new workout plan.</Text>
      <Button title="Add Exercise" onPress={handleAddExercise} />
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