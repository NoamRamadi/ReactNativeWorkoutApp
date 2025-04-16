import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import { useFloatingBanner } from "../../../src/context/FloatingBannerContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { executeQuery } from "@/src/database";
import CustomKeyboard from "./components/CustomKeyboard";
import { useWorkoutExecutionContext } from "@/src/context/WorkoutExecutionContext";
import { useTimer } from "@/src/context/TimerContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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
    startWorkoutTimer,
    pauseWorkoutTimer,
    resetWorkoutTimer,
    workoutElapsedTime,
  } = useWorkoutExecutionContext();

  const { remainingTime, isRunning, startTimer, pauseTimer, resetTimer } =
    useTimer();
  const [isTimerVisible, setIsTimerVisible] = useState<boolean>(false); // Controls visibility of the timer view

  // New state variables for the countdown timer
  const [timerDuration, setTimerDuration] = useState<number>(0); // Duration of the countdown timer (in seconds)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false); // Tracks if the timer is running

  // Add near other state declarations
  const [activePopup, setActivePopup] = useState<{
    exerciseIndex: number;
    setIndex: number;
  } | null>(null);

  // Remove the complex ref system
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  // Calculate screen width for positioning
  const screenWidth = Dimensions.get("window").width;

  // Create a properly typed ref map
  const setButtonRefs = useRef<{ [key: string]: any }>({});

  // Start the timer when the screen mounts
  useEffect(() => {
    startWorkoutTimer();
  }, []);

  // Populate the currentWorkoutExercises state with activeWorkout data
  useEffect(() => {
    if (loadedWorkoutPlan && loadedWorkoutPlan.length > 0) {
      setWorkoutName(loadedWorkoutPlan[0].plan_name);
      // Set the screen title
      navigation.setOptions({
        title: loadedWorkoutPlan[0].plan_name,
      });
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
                pauseTimer();
                resetTimer();
                resetWorkoutTimer();
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

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartTimer = (duration: number) => {
    startTimer(duration);
    setIsTimerVisible(false); // Close the timer overlay after starting
  };

  const formatWorkoutTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      setActivePopup(null);
    };

    // Add the touch handler to the main container
    return () => {
      // Cleanup
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.topContainer}>
        <TouchableOpacity
          style={[styles.topButton, styles.iconButton]}
          onPress={minimizeToBanner}
        >
          <Text style={styles.iconText}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topButton}
          onPress={() => setIsTimerVisible(true)} // Open the countdown timer overlay
        >
          <Text style={styles.topButtonText}>
            {remainingTime > 0 ? (
              formatTime(remainingTime)
            ) : (
              <MaterialIcons name="timer" size={23} color="#6B9BFF" />
            )}{" "}
          </Text>
        </TouchableOpacity>

        <View style={styles.clockContainer}>
          <Text style={styles.clockText}>
            {formatWorkoutTime(workoutElapsedTime)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.topButton, styles.finishButton]}
          onPress={() => {}}
        >
          <Text style={[styles.topButtonText, styles.finishButtonText]}>
            FINISH
          </Text>
        </TouchableOpacity>
      </View>
      {/* Display Timer View */}
      {isTimerVisible && (
        <View style={styles.timerOverlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsTimerVisible(false)} // Hide the countdown timer view
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
          <View style={styles.timerButtonsContainer}>
            {[30, 60, 90, 120].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={styles.timerButton}
                onPress={() => handleStartTimer(duration)}
              >
                <Text style={styles.timerButtonText}>
                  {Math.floor(duration / 60)}:
                  {(duration % 60).toString().padStart(2, "0")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
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
                      SET
                    </Text>
                    <Text
                      style={[styles.headerCell, styles.previousColumnHeader]}
                    >
                      PREVIOUS
                    </Text>
                    <Text style={[styles.headerCell, styles.repsColumnHeader]}>
                      REPS
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
                          <TouchableOpacity
                            ref={(ref) => {
                              if (ref) {
                                setButtonRefs.current[`${index}-${setIndex}`] =
                                  ref;
                              }
                            }}
                            style={styles.setColumn}
                            onPress={() => {
                              const buttonKey = `${index}-${setIndex}`;
                              const buttonRef =
                                setButtonRefs.current[buttonKey];

                              if (buttonRef) {
                                buttonRef.measure(
                                  (
                                    fx: number,
                                    fy: number,
                                    width: number,
                                    height: number,
                                    px: number,
                                    py: number
                                  ) => {
                                    setPopupPosition({
                                      top: py - height - 10,
                                      left: px + 10,
                                    });
                                    setActivePopup({
                                      exerciseIndex: index,
                                      setIndex: setIndex,
                                    });
                                  }
                                );
                              }
                            }}
                          >
                            <Text style={styles.cell}>{setIndex + 1}</Text>
                          </TouchableOpacity>
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
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => addSet(index)}
                    >
                      <Text style={styles.buttonText}>Add Set</Text>
                    </TouchableOpacity>
                    <View style={styles.buttonSpacer} />
                    <TouchableOpacity
                      style={[styles.button, styles.removeButton]}
                      onPress={() => removeExercise(index)}
                    >
                      <Text
                        style={[styles.buttonText, styles.removeButtonText]}
                      >
                        Remove Exercise
                      </Text>
                    </TouchableOpacity>
                  </View>
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

      {/* Render popup at root level */}
      {activePopup && (
        <View
          style={styles.popupOverlay}
          onTouchStart={() => setActivePopup(null)}
        >
          <View
            style={[
              styles.setTypePopup,
              {
                position: "absolute",
                top: popupPosition.top,
                left: popupPosition.left,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.popupOption}
              onPress={() => {
                // Handle warm up set
                setActivePopup(null);
              }}
            >
              <View style={styles.popupOptionContent}>
                <Text style={[styles.popupOptionLetter, styles.warmupLetter]}>
                  W
                </Text>
                <Text style={styles.popupOptionText}>Warm up</Text>
                <Text style={styles.popupOptionHint}>?</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.popupOption}
              onPress={() => {
                // Handle drop set
                setActivePopup(null);
              }}
            >
              <View style={styles.popupOptionContent}>
                <Text style={[styles.popupOptionLetter, styles.dropsetLetter]}>
                  D
                </Text>
                <Text style={styles.popupOptionText}>Drop set</Text>
                <Text style={styles.popupOptionHint}>?</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.popupOption, styles.lastPopupOption]}
              onPress={() => {
                // Handle failure set
                setActivePopup(null);
              }}
            >
              <View style={styles.popupOptionContent}>
                <Text style={[styles.popupOptionLetter, styles.failureLetter]}>
                  F
                </Text>
                <Text style={styles.popupOptionText}>Failure</Text>
                <Text style={styles.popupOptionHint}>?</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: "100%",
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
    borderTopWidth: 1,
    borderTopColor: "#6B9BFF",
    borderLeftWidth: 1,
    borderLeftColor: "#6B9BFF",
    borderRightWidth: 1,
    borderRightColor: "#6B9BFF",
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
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderLeftColor: "#6B9BFF",
    borderRightWidth: 1,
    borderRightColor: "#6B9BFF",
  },
  cell: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    borderBottomColor: "#6B9BFF",
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderLeftColor: "#6B9BFF",
    borderRightWidth: 1,
    borderRightColor: "#6B9BFF",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "stretch",
    marginTop: 12,
  },
  button: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6B9BFF",
  },
  removeButton: {
    backgroundColor: "#fff",
    borderColor: "#ff6b6b",
  },
  buttonText: {
    color: "#6B9BFF",
    fontSize: 14,
    fontWeight: "500",
  },
  removeButtonText: {
    color: "#ff6b6b",
  },
  buttonSpacer: {
    height: 8,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  topButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#6B9BFF",
    backgroundColor: "#fff",
  },
  topButtonText: {
    color: "#6B9BFF",
    fontSize: 14,
    fontWeight: "500",
  },
  clockContainer: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
  },
  clockText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  finishButton: {
    backgroundColor: "#6B9BFF",
  },
  finishButtonText: {
    color: "#fff",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  iconText: {
    fontSize: 20,
    color: "#6B9BFF",
    fontWeight: "bold",
  },

  timerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Ensure it appears above other elements
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 20, // Ensure the close button is above the overlay
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  timerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center", // Center items vertically
    gap: 10,
  },
  timerButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  timerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  iconContainer: {
    flex: 1, // Ensures the container takes up the full space of the button
    justifyContent: "center", // Centers vertically
    alignItems: "center", // Centers horizontally
  },
  setTypePopup: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6B9BFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    minWidth: 160,
  },
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  popupOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  popupOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  popupOptionLetter: {
    fontSize: 16,
    fontWeight: "bold",
    width: 24,
  },
  warmupLetter: {
    color: "#FF9F1C",
  },
  dropsetLetter: {
    color: "#9B5DE5",
  },
  failureLetter: {
    color: "#FF4D6D",
  },
  popupOptionText: {
    color: "#333",
    fontSize: 15,
    flex: 1,
    marginLeft: 12,
  },
  popupOptionHint: {
    color: "#999",
    fontSize: 14,
    marginLeft: 8,
  },
  lastPopupOption: {
    borderBottomWidth: 0,
  },
});
