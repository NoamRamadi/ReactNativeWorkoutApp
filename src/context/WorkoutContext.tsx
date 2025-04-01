import React, { createContext, useContext, useState } from "react";

// Define the shape of the workout context
interface WorkoutContextType {
  activeWorkout: any | null; // Replace `any` with a proper type if possible
  setActiveWorkout: (workout: any) => void; // Replace `any` with a proper type if possible
}

// Create the context
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// Custom hook to use the context
export const useWorkoutContext = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkoutContext must be used within a WorkoutProvider");
  }
  return context;
};

// Provider component
export const WorkoutProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeWorkout, setActiveWorkout] = useState<any | null>(null); // Replace `any` with a proper type

  return (
    <WorkoutContext.Provider value={{ activeWorkout, setActiveWorkout }}>
      {children}
    </WorkoutContext.Provider>
  );
};
