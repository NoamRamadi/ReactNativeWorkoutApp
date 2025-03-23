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
}

// Create the context
const NewWorkoutContext = createContext<NewWorkoutContextType | undefined>(
  undefined
);

// Create a provider component
export const NewWorkoutProvider: React.FC<{ children: React.ReactNode }> = ({
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

  return (
    <NewWorkoutContext.Provider
      value={{
        workoutName,
        setWorkoutName,
        selectedExercises,
        addExercise,
        removeExercise,
        updateSetDetails,
        clearSelectedExercises,
      }}
    >
      {children}
    </NewWorkoutContext.Provider>
  );
};

// Custom hook to use the context
export const useNewWorkoutContext = () => {
  const context = useContext(NewWorkoutContext);
  if (!context) {
    throw new Error(
      "useNewWorkoutContext must be used within a NewWorkoutProvider"
    );
  }
  return context;
};
