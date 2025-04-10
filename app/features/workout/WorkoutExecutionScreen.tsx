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
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { executeQuery } from "@/src/database";
import CustomKeyboard from "./components/CustomKeyboard";
import { useWorkoutExecutionContext } from "@/src/context/WorkoutExecutionContext";

type WorkoutExecutionScreenNavigationProp = StackNavigationProp<
  WorkoutStackParamList,
  "ActiveWorkout"
>;

type WorkoutStackParamList = {
  loadedWorkoutPlan: undefined; // or whatever params it takes
  SelectExercise: { source: string }; // Add this line
  WorkoutHome: undefined;
  ActiveWorkout: undefined;
  // ... other screens in your workout stack
};

export default function WorkoutExecutionScreen() {
  const navigation = useNavigation<WorkoutExecutionScreenNavigationProp>();
  const { showBanner } = useFloatingBanner();
  const [isMinimizing, setIsMinimizing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const {
    workoutName,
    loadedWorkoutPlan,
    setWorkoutName,
    currentWorkoutExercises,
    clearSelectedExercises,
    updateSetDetails,
    addSet,
    deleteSet,
    addExercise,
    removeExercise,
    toggleSetCompletion,
  } = useWorkoutExecutionContext();

  // Populate the currentWorkoutExercises state with activeWorkout data
  useEffect(() => {
    if (loadedWorkoutPlan && loadedWorkoutPlan.length > 0) {
      setWorkoutName(loadedWorkoutPlan[0].plan_name);
      // Only populate the state if selectedExercises is empty
      if (currentWorkoutExercises.length === 0) {
        // Clear any existing exercises
        clearSelectedExercises();

        // Group exercises by exercise_id and display_order
        const groupedExercises = loadedWorkoutPlan.reduce(
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
              updateSetDetails(
                currentExerciseIndex,
                setIndex,
                "reps",
                set.reps
              );
              updateSetDetails(currentExerciseIndex, setIndex, "kg", set.kg);
            });
          }
        );
      }
    }
  }, [loadedWorkoutPlan]);

  // Reset workout data when navigating back
  // Handle "Discard Changes" confirmation before leaving
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // If the user is saving or minimizing, allow navigation without confirmation
      if (isSaving || isMinimizing) return;

      // Check if there are unsaved changes
      if (workoutName.trim() || currentWorkoutExercises.length > 0) {
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
  }, [
    workoutName,
    currentWorkoutExercises,
    isSaving,
    isMinimizing,
    navigation,
  ]);

  const minimizeToBanner = () => {
    setIsMinimizing((prev) => true);
    showBanner(); // Show the floating banner

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

  const handleSaveWorkoutPlan = async () => {
    try {
      setIsSaving(true);

      // Check if all sets are completed
      const allSetsCompleted = currentWorkoutExercises.every((exercise) =>
        exercise.sets.every((set) => set.isCompleted)
      );

      if (!allSetsCompleted) {
        Alert.alert(
          "Incomplete Workout",
          "Please complete all sets before saving the workout.",
          [{ text: "OK" }]
        );
        return;
      }

      const workoutPlanId = loadedWorkoutPlan[0]?.workout_plan_id || null;
      let currentWorkoutPlanId = workoutPlanId;

      // Insert or Update the workout plan
      if (!currentWorkoutPlanId) {
        const workoutPlanInsertResult = await executeQuery(
          `INSERT INTO WorkoutPlans (plan_name, user_id) VALUES (?, ?);`,
          [workoutName, 1]
        );
        currentWorkoutPlanId = workoutPlanInsertResult.insertId;
      } else {
        await executeQuery(
          `UPDATE WorkoutPlans SET plan_name = ? WHERE workout_plan_id = ?;`,
          [workoutName, currentWorkoutPlanId]
        );
      }

      // Clear existing data (SQLite-compatible deletion)
      // First delete related sets
      await executeQuery(
        `DELETE FROM WorkoutPlanSets 
         WHERE workout_plan_exercise_id IN (
           SELECT workout_plan_exercise_id 
           FROM WorkoutPlanExercises 
           WHERE workout_plan_id = ?
         );`,
        [currentWorkoutPlanId]
      );

      // Then delete exercises
      await executeQuery(
        `DELETE FROM WorkoutPlanExercises WHERE workout_plan_id = ?;`,
        [currentWorkoutPlanId]
      );

      // Insert new exercises and sets
      for (const [exerciseIndex, entry] of currentWorkoutExercises.entries()) {
        const exerciseInsertResult = await executeQuery(
          `INSERT INTO WorkoutPlanExercises (workout_plan_id, exercise_id, display_order) 
           VALUES (?, ?, ?);`,
          [currentWorkoutPlanId, entry.exerciseId, exerciseIndex + 1]
        );

        const workoutPlanExerciseId = exerciseInsertResult.insertId;

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
      navigation.popToTop();
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
      <View>
        <Button title="Minimize" onPress={minimizeToBanner} />
      </View>

      <Text style={styles.label}>Workout Plan Name:</Text>
      <Text style={styles.label}>{loadedWorkoutPlan[0].plan_name}</Text>

      <View style={styles.container}>
        {/* Display Selected Exercises */}

        {currentWorkoutExercises.length > 0 ? (
          <FlatList
            data={currentWorkoutExercises}
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
                      ✔
                    </Text>
                  </View>
                  {/* Table Rows */}
                  {item.sets.map((set, setIndex) => {
                    const isLastRow = setIndex === item.sets.length - 1;
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
                        <View
                          style={[
                            isLastRow ? styles.lastRow : styles.row,
                            set.isCompleted && { backgroundColor: "#d1e7dd" },
                          ]}
                        >
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
                            onPress={() => toggleSetCompletion(index, setIndex)}
                          >
                            <Text style={[styles.vSymbol]}>✔</Text>
                          </TouchableOpacity>
                        </View>
                      </ReanimatedSwipeable>
                    );
                  })}
                  {/* Add Set Button */}
                  <Button title="Add Set" onPress={() => addSet(index)} />
                  {/* Remove Exercise Button */}
                  <Button
                    title="Remove Exercise"
                    onPress={() => removeExercise(index)}
                  />
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
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    borderLeftWidth: 1,
    borderLeftColor: "#ccc",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
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
    borderLeftWidth: 1,
    borderLeftColor: "#ccc",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
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
  lastRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderLeftColor: "#ccc",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
});
