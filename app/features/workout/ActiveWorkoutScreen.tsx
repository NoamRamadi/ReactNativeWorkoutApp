import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useFloatingBanner } from "../../../src/context/FloatingBannerContext";
import { StackActions, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
//import { WorkoutStackParamList } from "../../_layout"; // Adjust the import path as needed
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useNewWorkoutContext } from "@/src/context/NewWorkoutContext";
import { executeQuery } from "@/src/database";
import CustomKeyboard from "./components/CustomKeyboard";
import { useWorkoutContext } from "@/src/context/WorkoutContext";

type ActiveWorkoutScreenNavigationProp = StackNavigationProp<
  WorkoutStackParamList,
  "ActiveWorkout"
>;

type WorkoutStackParamList = {
  ActiveWorkout: undefined; // or whatever params it takes
  SelectExercise: { source: string }; // Add this line
  // ... other screens in your workout stack
};

export default function ActiveWorkoutScreen() {
  // Use the typed navigation object
  const navigation = useNavigation<ActiveWorkoutScreenNavigationProp>();
  const { showBanner } = useFloatingBanner();
  const { activeWorkout } = useWorkoutContext();
  const [isMinimizing, setIsMinimizing] = useState<boolean>(false);
  const {
    workoutName,
    setWorkoutName,
    selectedExercises,
    clearSelectedExercises,
    updateSetDetails,
    addSet,
    deleteSet,
    addExercise,
  } = useWorkoutContext();

  // Populate the selectedExercises state with activeWorkout data
  useEffect(() => {
    if (activeWorkout && activeWorkout.length > 0) {
      // Clear any existing exercises
      clearSelectedExercises();

      // Group exercises by exercise_id and display_order
      const groupedExercises = activeWorkout.reduce(
        (
          acc: any[],
          row: {
            exercise_id: any;
            exercise_name: any;
            set_number: any;
            planned_weight: any;
            planned_reps: any;
            display_order: any;
          }
        ) => {
          const {
            exercise_id,
            exercise_name,
            set_number,
            planned_weight,
            planned_reps,
            display_order,
          } = row;

          const uniqueKey = `${exercise_id}-${display_order}`;

          let exerciseEntry = acc.find((ex) => ex.uniqueKey === uniqueKey);
          if (!exerciseEntry) {
            exerciseEntry = {
              uniqueKey,
              exerciseId: exercise_id,
              name: exercise_name,
              displayOrder: display_order,
              sets: [],
            };
            acc.push(exerciseEntry);
          }

          if (set_number) {
            exerciseEntry.sets.push({
              reps: planned_reps?.toString() || "",
              kg: planned_weight?.toString() || "",
              isCompleted: false,
            });
          }

          return acc;
        },
        []
      );

      // Populate the context with the grouped exercises
      let currentExerciseIndex = -1; // Track the current exercise index
      groupedExercises.forEach(
        (exercise: { exerciseId: number; name: string; sets: any[] }) => {
          currentExerciseIndex++; // Increment the index for each exercise

          addExercise(exercise.exerciseId, exercise.name);

          exercise.sets.forEach((set, setIndex) => {
            addSet(currentExerciseIndex); // Use the tracked index
            updateSetDetails(currentExerciseIndex, setIndex, "reps", set.reps);
            updateSetDetails(currentExerciseIndex, setIndex, "kg", set.kg);
          });
        }
      );
    }
  }, [activeWorkout]);

  // Minimize the screen to a floating banner and navigate back to the start of the stack
  const minimizeToBanner = () => {
    // Set state immediately and use functional update
    setIsMinimizing((prev) => true);

    // Show banner immediately
    showBanner();

    // Add a small delay to ensure state updates
    setTimeout(() => {
      navigation.popToTop();
    }, 50);
  };

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
      // If the user is saving or minimizing, allow navigation without confirmation
      if (isSaving || isMinimizing) return;

      // Check if there are unsaved changes
      if (workoutName.trim() || selectedExercises.length > 0) {
        e.preventDefault(); // Prevent navigation

        // Show confirmation dialog
        Alert.alert(
          "Discard Workout Plan?",
          "You have unsaved changes. Are you sure you want to discard this workout plan?",
          [
            { text: "Cancel", style: "cancel", onPress: () => {} }, // Do nothing
            {
              text: "Discard",
              style: "destructive",
              onPress: () => {
                setWorkoutName(""); // Reset workout name
                clearSelectedExercises(); // Clear selected exercises
                navigation.dispatch(e.data.action); // Continue navigation
              },
            },
          ],
          { cancelable: true }
        );
      } else {
        // No unsaved changes, reset data silently

        clearSelectedExercises();
      }
    });

    return unsubscribe; // Cleanup the listener on unmount
  }, [workoutName, selectedExercises, isSaving, isMinimizing, navigation]);
  // Save the workout plan to the database
  const handleSaveWorkoutPlan = async () => {
    try {
      if (!workoutName.trim()) {
        alert("Please enter a name for the workout plan.");
        return;
      }

      // Set the saving flag to true
      setIsSaving(true);

      // Insert the workout plan into the database
      const workoutPlanInsertResult = await executeQuery(
        `INSERT INTO WorkoutPlans (plan_name, user_id) VALUES (?, ?);`,
        [workoutName, 1] // Replace `1` with the actual user ID if available
      );

      const workoutPlanId = workoutPlanInsertResult.insertId;

      // Insert selected exercises and their sets into the database
      for (const [exerciseIndex, entry] of selectedExercises.entries()) {
        // Insert the exercise into WorkoutPlanExercises with display_order
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
              setIndex + 1, // Set number
              set.kg !== "" ? parseFloat(set.kg) : null, // Handle empty kg
              set.reps !== "" ? parseInt(set.reps) : null, // Handle empty reps
            ]
          );
        }
      }

      alert("Workout plan saved successfully!");
      clearSelectedExercises(); // Clear selected exercises after saving
      navigation.goBack(); // Navigate back after saving
    } catch (error) {
      console.error("Error saving workout plan:", error);
      alert("Failed to save workout plan. Please try again.");
    } finally {
      // Reset the saving flag after saving is complete
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
      <View>
        <Button title="Minimize" onPress={minimizeToBanner} />
      </View>
      <Text>{activeWorkout[0].plan_name}</Text>
      <View style={styles.container}>
        {/* Display Selected Exercises */}

        {selectedExercises.length > 0 ? (
          <FlatList
            data={selectedExercises}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              return (
                <View style={styles.exerciseContainer}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
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
                  {item.sets.map((set, setIndex) => {
                    return (
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
                              value={set.reps} // Ensure this is a string
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
                              value={set.kg} // Ensure this is a string
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
                    );
                  })}
                  {/* Add Set Button */}
                  <Button title="Add Set" onPress={() => addSet(index)} />
                </View>
              );
            }}
          />
        ) : (
          <Text>No exercises selected yet.</Text>
        )}

        {/* Buttons */}
        <Button
          title="Add Exercise"
          onPress={() =>
            navigation.navigate("SelectExercise", { source: "ActiveWorkout" })
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
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
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
