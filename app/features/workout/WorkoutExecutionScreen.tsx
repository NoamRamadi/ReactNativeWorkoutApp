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
  ViewStyle,
  TextStyle,
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
import SetTypePopup from "./components/SetTypePopup";
import InfoPopup from "./components/InfoPopup";
import ExerciseRow from "./components/ExerciseRow";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from "../../constants/theme";

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

type Styles = {
  container: ViewStyle;
  text: TextStyle;
  title: TextStyle;
  label: TextStyle;
  input: ViewStyle;
  topContainer: ViewStyle;
  topButton: ViewStyle;
  topButtonText: TextStyle;
  clockContainer: ViewStyle;
  clockText: TextStyle;
  finishButton: ViewStyle;
  finishButtonText: TextStyle;
  iconButton: ViewStyle;
  iconText: TextStyle;
  timerOverlay: ViewStyle;
  closeButton: ViewStyle;
  closeButtonText: TextStyle;
  timerText: TextStyle;
  timerButtonsContainer: ViewStyle;
  timerButton: ViewStyle;
  timerButtonText: TextStyle;
  iconContainer: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    width: "100%",
    padding: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.sm,
  },
  input: {
    height: 40,
    borderColor: COLORS.border.light,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  topButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background.primary,
  },
  topButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
  clockContainer: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background.secondary,
  },
  clockText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  finishButton: {
    backgroundColor: COLORS.primary,
  },
  finishButtonText: {
    color: COLORS.text.white,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  iconText: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  timerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButton: {
    position: "absolute",
    top: SPACING.xl,
    right: SPACING.xl,
    padding: SPACING.md,
    zIndex: 20,
  },
  closeButtonText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  timerText: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.white,
    marginBottom: SPACING.xl,
  },
  timerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  timerButton: {
    backgroundColor: COLORS.background.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.xs,
  },
  timerButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

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

  // Add new state for info popup
  const [infoPopup, setInfoPopup] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Add info messages
  const setTypeInfo = {
    warmup: {
      title: "About Warm-up Sets",
      message:
        "Warm-up sets are intended to prepare your muscles and joints for heavier loads. They help prevent injury and improve your performance in working sets. Mark sets as warm-up to track your warm-up progression.",
    },
    dropset: {
      title: "About Drop Sets",
      message:
        "Drop sets involve performing an exercise at a heavy weight until failure, then immediately reducing the weight and continuing. This technique helps maximize muscle fatigue and can stimulate muscle growth.",
    },
    failure: {
      title: "About Failure Sets",
      message:
        "Training to failure means performing reps until you cannot complete another rep with proper form. This technique can help push your muscles to their limit, but should be used strategically to avoid overtraining.",
    },
  };

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

  const handleSetPress = (
    exerciseIndex: number,
    setIndex: number,
    buttonRef: any
  ) => {
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
          top: py + height + 5,
          left: px,
        });
        setActivePopup({
          exerciseIndex,
          setIndex,
        });
      }
    );
  };

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
            renderItem={({ item, index }) => (
              <ExerciseRow
                exercise={item}
                index={index}
                setButtonRefs={setButtonRefs}
                onSetPress={handleSetPress}
                onInputPress={(exerciseIndex, setIndex, field) =>
                  setFocusedInput({ exerciseIndex, setIndex, field })
                }
                onToggleCompletion={toggleSetCompletion}
                onDeleteSet={handleDeleteSet}
                onAddSet={addSet}
                onRemoveExercise={removeExercise}
              />
            )}
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
        <SetTypePopup
          position={popupPosition}
          onClose={() => setActivePopup(null)}
          onSetTypeSelect={(type) => {
            // Handle set type selection
            setActivePopup(null);
          }}
          onInfoPress={(type) => setInfoPopup(setTypeInfo[type])}
        />
      )}

      {/* Info Popup */}
      {infoPopup && (
        <InfoPopup
          title={infoPopup.title}
          message={infoPopup.message}
          onClose={() => setInfoPopup(null)}
        />
      )}
    </GestureHandlerRootView>
  );
}
