import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import ExerciseListBase from '../components/ExerciseListBase';

export default function SelectExerciseScreen() {
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);

  // Handle exercise selection
  const handleSelectExercise = (exerciseId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedExercises((prev) => [...prev, exerciseId]);
    } else {
      setSelectedExercises((prev) => prev.filter((id) => id !== exerciseId));
    }
  };

  return (
    <View style={styles.container}>
      <ExerciseListBase isSelectable={true} onSelectExercise={handleSelectExercise} />

      {/* Display Selected Exercises */}
      <View style={styles.selectedContainer}>
        <Text>Selected Exercises:</Text>
        {selectedExercises.length > 0 ? (
          selectedExercises.map((id) => <Text key={id}>Exercise ID: {id}</Text>)
        ) : (
          <Text>No exercises selected.</Text>
        )}
      </View>

      {/* Save Button (Placeholder) */}
      <Button title="Save Selected Exercises" onPress={() => alert('Save functionality not implemented yet')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectedContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
});