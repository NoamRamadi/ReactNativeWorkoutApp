import { WorkoutSet, WorkoutExercise } from "../workout/workout.types";

export interface WorkoutContextState {
  workoutName: string;
  currentWorkoutExercises: WorkoutExercise[];
}

export interface WorkoutContextActions {
  setWorkoutName: (name: string) => void;
  addExercise: (exerciseId: number, name: string) => void;
  removeExercise: (index: number) => void;
  addSet: (exerciseIndex: number) => void;
  deleteSet: (exerciseIndex: number, setIndex: number) => void;
  updateSetDetails: (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "kg",
    value: string
  ) => void;
  toggleSetCompletion: (exerciseIndex: number, setIndex: number) => void;
  clearSelectedExercises: () => void;
}

export interface FloatingBannerContextState {
  isVisible: boolean;
  message: string;
}

export interface FloatingBannerContextActions {
  showBanner: (message: string) => void;
  hideBanner: () => void;
}
