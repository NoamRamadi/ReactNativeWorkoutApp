import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { executeQuery } from "../../../src/database/queries";
import { useNewWorkoutContext } from "../../../src/context/NewWorkoutContext";
import CustomKeyboard from "./components/CustomKeyboard";

export default function NewWorkoutPlanScreen() {
  const navigation = useNavigation();
  const {
    workoutName,
    setWorkoutName,
    selectedExercises,
    clearSelectedExercises,
    updateSetDetails,
  } = useNewWorkoutContext();

  // State for custom keyboard
  const [focusedInput, setFocusedInput] = useState<{
    exerciseIndex: number;
    setIndex: number;
    field: "reps" | "kg";
  } | null>(null);

  // Save the workout plan to the database
  const handleSaveWorkoutPlan = async () => {
    try {
      if (!workoutName.trim()) {
        alert("Please enter a name for the workout plan.");
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
        for (const set of entry.sets) {
          await executeQuery(
            `INSERT INTO WorkoutPlanExercises (workout_plan_id, exercise_id, reps, kg) VALUES (?, ?, ?, ?);`,
            [workoutPlanId, entry.exerciseId, set.reps, set.kg]
          );
        }
      }

      alert("Workout plan saved successfully!");
      clearSelectedExercises(); // Clear selected exercises after saving
      navigation.goBack(); // Navigate back after saving
    } catch (error) {
      console.error("Error saving workout plan:", error);
      alert("Failed to save workout plan. Please try again.");
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
            <View style={styles.exerciseContainer}>
              <Text style={styles.exerciseName}>Exercise: {item.name}</Text>

              {/* Table Headers */}
              <View style={styles.headerRow}>
                <Text style={styles.headerCell}>Set</Text>
                <Text style={styles.headerCell}>Reps</Text>
                <Text style={styles.headerCell}>KG</Text>
                <Text style={styles.headerCell}>V</Text>
              </View>

              {/* Table Rows */}
              {item.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.row}>
                  <Text style={styles.cell}>{setIndex + 1}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setFocusedInput({
                        exerciseIndex: index,
                        setIndex,
                        field: "reps",
                      })
                    }
                    style={styles.inputWrapper} // Add a wrapper style for layout consistency
                  >
                    <TextInput
                      style={styles.inputCell}
                      value={set.reps}
                      editable={false} // Disable direct editing
                      placeholder="Reps"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      setFocusedInput({
                        exerciseIndex: index,
                        setIndex,
                        field: "kg",
                      })
                    }
                    style={styles.inputWrapper} // Add a wrapper style for layout consistency
                  >
                    <TextInput
                      style={styles.inputCell}
                      value={set.kg}
                      editable={false} // Disable direct editing
                      placeholder="KG"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {}}>
                    <Text style={styles.vSymbol}>
                      {set.isCompleted ? "✔" : "○"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        />
      ) : (
        <Text>No exercises selected yet.</Text>
      )}

      {/* Buttons */}
      <Button
        title="Add Exercise"
        onPress={() => navigation.navigate("SelectExercise")}
      />
      <Button title="Save Workout Plan" onPress={handleSaveWorkoutPlan} />

      {/* Custom Keyboard */}
      {focusedInput && (
        <CustomKeyboard
          onKeyPress={(key) => {
            if (focusedInput) {
              const { exerciseIndex, setIndex, field } = focusedInput;
              updateSetDetails(exerciseIndex, setIndex, field, key); // Update the field
            }
          }}
          onClose={() => setFocusedInput(null)}
        />
      )}
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
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  exerciseContainer: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: "center", // Center the TextInput vertically
  },
  inputCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
  },
  vSymbol: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    width: "100%",
  },
});
