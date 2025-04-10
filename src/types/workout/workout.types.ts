export interface WorkoutPlan {
  workout_plan_id: number;
  plan_name: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Exercise {
  exerciseId: number;
  name: string;
  bodyPart: string;
  equipment: string;
  profilePicture?: string;
  formPicture?: string;
  instruction?: string;
}

export interface WorkoutSet {
  reps: string;
  kg: string;
  isCompleted: boolean;
}

export interface WorkoutExercise {
  exerciseId: number;
  name: string;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  workoutName: string;
  exercises: WorkoutExercise[];
}
