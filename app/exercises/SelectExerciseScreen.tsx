import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import ExerciseListBase from './components/ExerciseListBase';
import { useNavigation } from '@react-navigation/native';
import { useNewWorkoutContext } from '../../src/context/NewWorkoutContext';

export default function SelectExerciseScreen() {
  const navigation = useNavigation();
  const { selectedExercises, addExercise } = useNewWorkoutContext();

  // Handle exercise selection
  const handleSelectExercise = (exerciseId: number) => {
    addExercise(exerciseId); // Add the exercise every time it's clicked
  };

  // Navigate back to NewWorkoutPlanScreen
  const handleSaveSelectedExercises = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ExerciseListBase isSelectable={true} onSelectExercise={handleSelectExercise} />

      {/* Display Selected Exercises */}
      <View style={styles.selectedContainer}>
        <Text>Selected Exercises:</Text>
        {selectedExercises.length > 0 ? (
          selectedExercises.map((entry, index) => (
            <Text key={index}>Exercise ID: {entry.exerciseId}</Text>
          ))
        ) : (
          <Text>No exercises selected.</Text>
        )}
      </View>

      {/* Save Button */}
      <Button title="Save Selected Exercises" onPress={handleSaveSelectedExercises} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  selectedContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
});