import React from 'react';
import { View, Text, StyleSheet, Button, TextInput, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { executeQuery } from '../../../src/database/queries';
import { useNewWorkoutContext } from '../../../src/context/NewWorkoutContext';

export default function NewWorkoutPlanScreen() {
  const navigation = useNavigation();
  const { workoutName, setWorkoutName, selectedExercises, clearSelectedExercises } =
    useNewWorkoutContext();

  // Save the workout plan to the database
  const handleSaveWorkoutPlan = async () => {
    try {
      if (!workoutName.trim()) {
        alert('Please enter a name for the workout plan.');
        return;
      }

      // Insert the workout plan into the database
      const workoutPlanInsertResult = await executeQuery(
        `INSERT INTO WorkoutPlans (name) VALUES (?);`,
        [workoutName]
      );

      const workoutPlanId = workoutPlanInsertResult.insertId;

      // Insert selected exercises into the WorkoutPlanExercises table
      for (const entry of selectedExercises) {
        await executeQuery(
          `INSERT INTO WorkoutPlanExercises (workout_plan_id, exercise_id) VALUES (?, ?);`,
          [workoutPlanId, entry.exerciseId]
        );
      }

      alert('Workout plan saved successfully!');
      clearSelectedExercises(); // Clear selected exercises after saving
      navigation.goBack(); // Navigate back after saving
    } catch (error) {
      console.error('Error saving workout plan:', error);
      alert('Failed to save workout plan. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Workout Plan</Text>

      {/* Input for Workout Plan Name */}
      <Text style={styles.label}>Workout Plan Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter workout plan name"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      {/* Display Selected Exercises */}
      <Text style={styles.label}>Selected Exercises:</Text>
      {selectedExercises.length > 0 ? (
        <FlatList
          data={selectedExercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text>
              Exercise ID: {item.exerciseId} - Reps/Sets: {item.repetitions || 'N/A'}/{item.sets || 'N/A'}
            </Text>
          )}
        />
      ) : (
        <Text>No exercises selected yet.</Text>
      )}

      {/* Buttons */}
      <Button title="Add Exercise" onPress={() => navigation.navigate('SelectExercise')} />
      <Button title="Save Workout Plan" onPress={handleSaveWorkoutPlan} />
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
});