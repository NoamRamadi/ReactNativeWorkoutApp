import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import ExerciseListBase from "./components/ExerciseListBase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useNewWorkoutContext } from "../../../src/context/NewWorkoutContext";
import { useWorkoutContext } from "../../../src/context/WorkoutContext";
import { fetchQuery } from "../../../src/database/queries";

export default function SelectExerciseScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { source } = (route.params as { source?: any }) || {};

  // Use the appropriate context based on the source
  const newWorkoutContext = useNewWorkoutContext();
  const workoutContext = useWorkoutContext();

  const isFromNewWorkoutPlan = source === "NewWorkoutPlan";
  const { addExercise } = isFromNewWorkoutPlan
    ? newWorkoutContext
    : workoutContext;

  // Handle exercise selection
  const handleSelectExercise = async (exerciseId: number) => {
    try {
      // Fetch exercise details
      const exercises = await fetchQuery(
        "SELECT * FROM Exercises WHERE exercise_id = ?;",
        [exerciseId]
      );
      if (exercises.length > 0) {
        const { name } = exercises[0];
        addExercise(exerciseId, name); // Add exercise with its name
      }
    } catch (error) {
      console.error("Error fetching exercise details:", error);
    }
  };

  // Navigate back to the appropriate screen
  const handleSaveSelectedExercises = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ExerciseListBase
        isSelectable={true}
        onSelectExercise={handleSelectExercise}
      />
      <Button
        title="Save Selected Exercises"
        onPress={handleSaveSelectedExercises}
      />
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
