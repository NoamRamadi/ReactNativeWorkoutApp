import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import ExerciseListBase from "./components/ExerciseListBase";
import { useNavigation, useRoute } from "@react-navigation/native";
//import { useNewWorkoutContext } from "../../../src/context/NewWorkoutContext";
import { useWorkoutExecutionContext } from "../../../src/context/WorkoutExecutionContext";
import { fetchQuery } from "../../../src/database/queries";
import { useWorkoutCreateContext } from "@/src/context/WorkoutCreateContext";

export default function SelectExerciseScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { source } = (route.params as { source?: string }) || {};

  const workoutCreateContext = useWorkoutCreateContext();
  const workoutExecutionContext = useWorkoutExecutionContext();

  const isFromNewWorkoutPlan = source === "NewWorkoutPlan";
  const { addExercise } = isFromNewWorkoutPlan
    ? workoutCreateContext
    : workoutExecutionContext;

  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);

  const handleSelectExercise = async (exerciseId: number) => {
    try {
      if (selectedExercises.includes(exerciseId)) {
        setSelectedExercises((prev) => prev.filter((id) => id !== exerciseId));
      } else {
        setSelectedExercises((prev) => [...prev, exerciseId]);
      }
    } catch (error) {
      console.error("Error handling exercise selection:", error);
    }
  };

  const handleSaveSelectedExercises = async () => {
    try {
      for (const exerciseId of selectedExercises) {
        const exercises = await fetchQuery(
          "SELECT * FROM Exercises WHERE exercise_id = ?;",
          [exerciseId]
        );
        if (exercises.length > 0) {
          const { name } = exercises[0];
          addExercise(exerciseId, name);
        }
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving selected exercises:", error);
      alert("Failed to save selected exercises. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <ExerciseListBase
        isSelectable={true}
        selectedExercises={selectedExercises}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
