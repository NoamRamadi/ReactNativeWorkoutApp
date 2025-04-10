import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useNavigation } from "@react-navigation/native";
import { executeQuery } from "../../../src/database/queries";
import { useNewWorkoutContext } from "../../../src/context/NewWorkoutContext";
import CustomKeyboard from "./components/CustomKeyboard";
import { StackNavigationProp } from "@react-navigation/stack";
import { WorkoutStackParamList } from "@/src/types/navigation/navigation.types";
import { WorkoutExercise, WorkoutSet } from "@/src/types/workout/workout.types";

type WorkoutNavigationProp = StackNavigationProp<
  WorkoutStackParamList,
  "WorkoutHome"
>;

export default function NewWorkoutPlanScreen() {
  const navigation = useNavigation<WorkoutNavigationProp>();
  const {
    workoutName,
    setWorkoutName,
    selectedExercises,
    clearSelectedExercises,
    updateSetDetails,
    addSet,
    deleteSet,
    removeExercise,
  } = useNewWorkoutContext();

  // State for custom keyboard
  const [focusedInput, setFocusedInput] = useState<{
    exerciseIndex: number;
    setIndex: number;
    field: "reps" | "kg";
  } | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Reset workout data when navigating back
  // Handle "Discard Changes" confirmation before leaving
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // If the user is saving, allow navigation without confirmation
      if (isSaving) return;

      if (workoutName.trim() || selectedExercises.length > 0) {
        e.preventDefault();

        Alert.alert(
          "Discard Workout Plan?",
          "You have unsaved changes. Are you sure you want to discard this workout plan?",
          [
            { text: "Cancel", style: "cancel", onPress: () => {} },
            {
              text: "Discard",
              style: "destructive",
              onPress: () => {
                setWorkoutName("");
                clearSelectedExercises();
                navigation.dispatch(e.data.action);
              },
            },
          ],
          { cancelable: true }
        );
      } else {
        setWorkoutName("");
        clearSelectedExercises();
      }
    });

    return unsubscribe;
  }, [navigation, workoutName, selectedExercises, isSaving]);

  const handleSaveWorkoutPlan = async () => {
    try {
      if (!workoutName.trim()) {
        alert("Please enter a name for the workout plan.");
        return;
      }

      setIsSaving(true);

      const workoutPlanInsertResult = await executeQuery(
        `INSERT INTO WorkoutPlans (plan_name, user_id) VALUES (?, ?);`,
        [workoutName, 1] // Replace `1` with the actual user ID if available
      );

      const workoutPlanId = workoutPlanInsertResult.insertId;

      for (const [exerciseIndex, entry] of selectedExercises.entries()) {
        const workoutPlanExerciseInsertResult = await executeQuery(
          `INSERT INTO WorkoutPlanExercises (workout_plan_id, exercise_id, display_order) VALUES (?, ?, ?);`,
          [workoutPlanId, entry.exerciseId, exerciseIndex + 1]
        );

        const workoutPlanExerciseId = workoutPlanExerciseInsertResult.insertId;

        // Insert sets for the exercise into WorkoutPlanSets
        for (const [setIndex, set] of entry.sets.entries()) {
          await executeQuery(
            `INSERT INTO WorkoutPlanSets (
              workout_plan_exercise_id,
              set_number,
              weight,
              reps
            ) VALUES (?, ?, ?, ?);`,
            [
              workoutPlanExerciseId,
              setIndex + 1,
              set.kg !== "" ? parseFloat(set.kg) : null,
              set.reps !== "" ? parseInt(set.reps) : null,
            ]
          );
        }
      }

      alert("Workout plan saved successfully!");
      clearSelectedExercises();
      setWorkoutName("");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving workout plan:", error);
      alert("Failed to save workout plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    Alert.alert(
      "Delete Set",
      "Are you sure you want to delete this set?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteSet(exerciseIndex, setIndex),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                  <Text style={[styles.headerCell, styles.setColumnHeader]}>
                    Set
                  </Text>
                  <Text
                    style={[styles.headerCell, styles.previousColumnHeader]}
                  >
                    Previous
                  </Text>
                  <Text style={[styles.headerCell, styles.repsColumnHeader]}>
                    Reps
                  </Text>
                  <Text style={[styles.headerCell, styles.kgColumnHeader]}>
                    KG
                  </Text>
                  <Text style={[styles.headerCell, styles.vColumnHeader]}>
                    V
                  </Text>
                </View>

                {/* Table Rows */}
                {item.sets.map((set, setIndex) => (
                  <ReanimatedSwipeable
                    key={setIndex}
                    friction={2}
                    rightThreshold={40}
                    renderRightActions={() => (
                      <TouchableOpacity
                        onPress={() => handleDeleteSet(index, setIndex)}
                        style={styles.deleteAction}
                      >
                        <Text style={styles.deleteActionText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  >
                    <View style={styles.row}>
                      <Text style={[styles.cell, styles.setColumn]}>
                        {setIndex + 1}
                      </Text>
                      <TouchableOpacity
                        style={[styles.previousColumn]}
                        onPress={() => {}}
                      >
                        <Text>{"place holder"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          setFocusedInput({
                            exerciseIndex: index,
                            setIndex,
                            field: "reps",
                          })
                        }
                        style={[styles.inputWrapper, styles.kgColumn]}
                      >
                        <TextInput
                          style={[styles.inputCell]}
                          value={set.reps}
                          editable={false}
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
                        style={styles.inputWrapper}
                      >
                        <TextInput
                          style={[styles.inputCell]}
                          value={set.kg}
                          editable={false}
                          placeholder="KG"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.vColumn]}
                        onPress={() => {}}
                      >
                        <Text style={[styles.vSymbol]}>
                          {set.isCompleted ? "✔" : "○"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ReanimatedSwipeable>
                ))}

                {/* Add Set Button */}
                <Button title="Add Set" onPress={() => addSet(index)} />
                {/* Remove Exercise Button */}
                <Button
                  title="Remove Exercise"
                  onPress={() => removeExercise(index)}
                />
              </View>
            )}
          />
        ) : (
          <Text>No exercises selected yet.</Text>
        )}

        {/* Buttons */}
        <Button
          title="Add Exercise"
          onPress={() =>
            navigation.navigate("SelectExercise", { source: "NewWorkoutPlan" })
          }
        />
        <Button title="Save Workout Plan" onPress={handleSaveWorkoutPlan} />

        {/* Custom Keyboard */}
        {focusedInput && (
          <CustomKeyboard
            onKeyPress={(key) => {
              if (focusedInput) {
                const { exerciseIndex, setIndex, field } = focusedInput;
                updateSetDetails(exerciseIndex, setIndex, field, key);
              }
            }}
            onClose={() => setFocusedInput(null)}
          />
        )}
      </View>
    </GestureHandlerRootView>
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
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  cell: {
    textAlign: "center",
    fontSize: 14,
  },
  inputWrapper: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  inputCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    width: "95%",
  },
  vSymbol: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    width: "100%",
  },
  deleteAction: {
    backgroundColor: "#ff4d4d", // Red background
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
  },
  deleteActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  setColumn: {
    width: "15%", // 10% of the width
    justifyContent: "center",
  },
  previousColumn: {
    width: "20%", // 10% of the width
    justifyContent: "center",
  },
  repsColumn: {
    width: "25%", // 30% of the width
    justifyContent: "center",
  },
  kgColumn: {
    width: "25%", // 30% of the width
    justifyContent: "center",
  },
  vColumn: {
    width: "15%", // 20% of the width
    justifyContent: "center",
  },

  setColumnHeader: {
    width: "15%", // 10% of the width
    justifyContent: "center",
  },
  previousColumnHeader: {
    width: "20%", // 10% of the width
    justifyContent: "center",
  },
  repsColumnHeader: {
    width: "25%", // 30% of the width
    justifyContent: "center",
  },
  kgColumnHeader: {
    width: "25%", // 30% of the width
    justifyContent: "center",
  },
  vColumnHeader: {
    width: "15%", // 20% of the width
    justifyContent: "center",
  },
});
