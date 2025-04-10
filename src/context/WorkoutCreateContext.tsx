import React, { createContext, useState, useContext } from "react";

// Define the shape of an exercise entry
interface ExerciseEntry {
  exerciseId: number;
  name: string; // Add exercise name
  sets: { reps: string; kg: string; isCompleted: boolean }[]; // Store sets with user inputs
}

// Define the shape of the context
interface NewWorkoutContextType {
  workoutName: string;
  setWorkoutName: (name: string) => void;
  selectedExercises: ExerciseEntry[];
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
}

// Create the context
const WorkoutCreateContext = createContext<NewWorkoutContextType | undefined>(
  undefined
);

// Create a provider component
export const WorkoutCreateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [workoutName, setWorkoutName] = useState<string>("");
  const [selectedExercises, setSelectedExercises] = useState<ExerciseEntry[]>(
    []
  );

  // Add an exercise to the selected list
  const addExercise = (exerciseId: number, name: string) => {
    setSelectedExercises((prev) => [
      ...prev,
      { exerciseId, name, sets: [{ reps: "", kg: "", isCompleted: false }] }, // Start with one set
    ]);
  };

  // Update reps or kg for a specific set
  const updateSetDetails = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "kg",
    value: string
  ) => {
    setSelectedExercises((prev) => {
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
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all selected exercises
  const clearSelectedExercises = () => {
    setSelectedExercises([]);
  };

  const addSet = (exerciseIndex: number) => {
    setSelectedExercises((prev) => {
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
    setSelectedExercises((prev) => {
      const updatedExercises = [...prev];
      if (updatedExercises[exerciseIndex]) {
        // Remove the set at the specified index
        updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      }
      return updatedExercises;
    });
  };

  return (
    <WorkoutCreateContext.Provider
      value={{
        workoutName,
        setWorkoutName,
        selectedExercises,
        addExercise,
        removeExercise,
        updateSetDetails,
        clearSelectedExercises,
        addSet,
        deleteSet,
      }}
    >
      {children}
    </WorkoutCreateContext.Provider>
  );
};

// Custom hook to use the context
export const useWorkoutCreateContext = () => {
  const context = useContext(WorkoutCreateContext);
  if (!context) {
    throw new Error(
      "useWorkoutCreateContext must be used within a WorkoutCreateProvider"
    );
  }
  return context;
};
