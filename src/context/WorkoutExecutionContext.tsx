import React, { createContext, useContext, useEffect, useState } from "react";

// Define the shape of an exercise entry
interface ExerciseEntry {
  exerciseId: number;
  name: string; // Add exercise name
  sets: { reps: string; kg: string; isCompleted: boolean }[]; // Store sets with user inputs
}

// Define the shape of the workout context
interface WorkoutContextType {
  loadedWorkoutPlan: any | null; // Replace `any` with a proper type if possible
  setLoadedWorkoutPlan: (workout: any) => void; // Replace `any` with a proper type if possible
  workoutName: string;
  setWorkoutName: (name: string) => void;
  currentWorkoutExercises: ExerciseEntry[];
  addExercise: (exerciseId: number, name: string) => void;
  updateSetDetails: (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "kg",
    value: string
  ) => void;
  clearSelectedExercises: () => void;
  removeExercise: (index: number) => void;
  addSet: (exerciseIndex: number) => void;
  deleteSet: (exerciseIndex: number, setIndex: number) => void;
  toggleSetCompletion: (exerciseIndex: number, setIndex: number) => void;

  // New properties for the up timer
  workoutElapsedTime: number; // Duration of the workout in seconds
  isWorkoutTimerRunning: boolean; // Tracks if the timer is running
  startWorkoutTimer: () => void; // Starts the timer
  pauseWorkoutTimer: () => void; // Pauses the timer
  resetWorkoutTimer: () => void; // Resets the timer
}

// Create the context
export const WorkoutExecutionContext = createContext<
  WorkoutContextType | undefined
>(undefined);

// Custom hook to use the context
export const useWorkoutExecutionContext = () => {
  const context = useContext(WorkoutExecutionContext);
  if (!context) {
    throw new Error(
      "useWorkoutExecutionContext must be used within a WorkoutExecutionProvider"
    );
  }
  return context;
};

// Provider component
export function WorkoutExecutionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loadedWorkoutPlan, setLoadedWorkoutPlan] = useState<any | null>(null); // Replace `any` with a proper type
  const [workoutName, setWorkoutName] = useState<string>("");
  const [currentWorkoutExercises, setCurrentWorkoutExercises] = useState<
    ExerciseEntry[]
  >([]);

  // New state for the up timer
  const [workoutElapsedTime, setWorkoutElapsedTime] = useState<number>(0);
  const [isWorkoutTimerRunning, setIsWorkoutTimerRunning] =
    useState<boolean>(false);

  // Add an exercise to the selected list
  const addExercise = (exerciseId: number, name: string) => {
    setCurrentWorkoutExercises((prev) => [
      ...prev,
      { exerciseId, name, sets: [] }, // Start with one set
    ]);
  };

  // Update reps or kg for a specific set
  const updateSetDetails = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "kg",
    value: string
  ) => {
    setCurrentWorkoutExercises((prev) => {
      const updatedExercises = [...prev];
      if (updatedExercises[exerciseIndex]) {
        const currentValue =
          updatedExercises[exerciseIndex].sets[setIndex][field] || "";

        if (value === "delete") {
          // Remove the last character
          updatedExercises[exerciseIndex].sets[setIndex][field] =
            currentValue.slice(0, -1);
        } else {
          // Append the new value
          updatedExercises[exerciseIndex].sets[setIndex][field] =
            currentValue + value;
        }
      }
      return updatedExercises;
    });
  };

  // Remove an exercise from the selected list by index
  const removeExercise = (index: number) => {
    setCurrentWorkoutExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all selected exercises
  const clearSelectedExercises = () => {
    setCurrentWorkoutExercises([]);
  };

  const addSet = (exerciseIndex: number) => {
    setCurrentWorkoutExercises((prev) => {
      const updatedExercises = [...prev];
      if (updatedExercises[exerciseIndex]) {
        updatedExercises[exerciseIndex].sets.push({
          reps: "", // Empty reps
          kg: "", // Empty kg
          isCompleted: false,
        });
      }
      return updatedExercises;
    });
  };

  const deleteSet = (exerciseIndex: number, setIndex: number) => {
    setCurrentWorkoutExercises((prev) => {
      const updatedExercises = [...prev];
      if (updatedExercises[exerciseIndex]) {
        // Remove the set at the specified index
        updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      }
      return updatedExercises;
    });
  };

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    setCurrentWorkoutExercises((prev) => {
      const updatedExercises = [...prev];
      if (updatedExercises[exerciseIndex]) {
        // Toggle the isCompleted value
        updatedExercises[exerciseIndex].sets[setIndex].isCompleted =
          !updatedExercises[exerciseIndex].sets[setIndex].isCompleted;
      }
      return updatedExercises;
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isWorkoutTimerRunning) {
      interval = setInterval(() => {
        setWorkoutElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutTimerRunning]);

  const startWorkoutTimer = () => {
    setIsWorkoutTimerRunning(true);
  };

  const pauseWorkoutTimer = () => {
    setIsWorkoutTimerRunning(false);
  };

  const resetWorkoutTimer = () => {
    setIsWorkoutTimerRunning(false);
    setWorkoutElapsedTime(0);
  };

  return (
    <WorkoutExecutionContext.Provider
      value={{
        loadedWorkoutPlan,
        workoutName,
        setLoadedWorkoutPlan,
        setWorkoutName,
        currentWorkoutExercises,
        addExercise,
        removeExercise,
        updateSetDetails,
        clearSelectedExercises,
        addSet,
        deleteSet,
        toggleSetCompletion,
        workoutElapsedTime,
        isWorkoutTimerRunning,
        startWorkoutTimer,
        pauseWorkoutTimer,
        resetWorkoutTimer,
      }}
    >
      {children}
    </WorkoutExecutionContext.Provider>
  );
}
