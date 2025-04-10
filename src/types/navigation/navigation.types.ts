export type WorkoutStackParamList = {
  WorkoutHome: undefined;
  NewWorkoutPlan: undefined;
  ActiveWorkout: undefined;
  SelectExercise: { source: string };
  WorkoutPlanDetails: { planId: number };
};

export type RootStackParamList = {
  Workout: undefined;
  Exercises: undefined;
  History: undefined;
  Measure: undefined;
  Profile: undefined;
};

export type ExerciseStackParamList = {
  ExerciseList: undefined;
  ExerciseDetails: { exerciseId: number };
  SelectExercise: { source: string };
};
