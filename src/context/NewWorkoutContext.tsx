import React, { createContext, useState, useContext } from 'react';

// Define the shape of an exercise entry
interface ExerciseEntry {
  exerciseId: number;
  repetitions?: number; // Optional: Add fields like repetitions, sets, etc.
  sets?: number;
}

// Define the shape of the context
interface NewWorkoutContextType {
  workoutName: string;
  setWorkoutName: (name: string) => void;
  selectedExercises: ExerciseEntry[];
  addExercise: (exerciseId: number) => void;
  removeExercise: (index: number) => void; // Remove by index instead of ID
  clearSelectedExercises: () => void;
}

// Create the context
const NewWorkoutContext = createContext<NewWorkoutContextType | undefined>(undefined);

// Create a provider component
export const NewWorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workoutName, setWorkoutName] = useState<string>('');
  const [selectedExercises, setSelectedExercises] = useState<ExerciseEntry[]>([]);

  // Add an exercise to the selected list
  const addExercise = (exerciseId: number) => {
    setSelectedExercises((prev) => [...prev, { exerciseId }]);
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
    throw new Error('useNewWorkoutContext must be used within a NewWorkoutProvider');
  }
  return context;
};