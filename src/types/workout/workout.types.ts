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

export interface GroupedExercise {
  uniqueKey: string;
  exerciseId: number;
  name: string;
  bodyPart: string;
  equipment: string;
  sets: WorkoutSet[];
}

export interface WorkoutPlanDetails {
  workout_plan_id: number;
  plan_name: string;
  exercise_id: number;
  exercise_name: string;
  body_part: string;
  equipment: string;
  display_order: number;
  set_number: number | null;
  planned_reps: number | null;
  planned_weight: number | null;
}
