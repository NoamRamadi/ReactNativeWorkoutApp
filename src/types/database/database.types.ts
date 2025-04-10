export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface WorkoutPlanExercise {
  workout_plan_exercise_id: number;
  workout_plan_id: number;
  exercise_id: number;
  display_order: number;
}

export interface WorkoutPlanSet {
  workout_plan_set_id: number;
  workout_plan_exercise_id: number;
  set_number: number;
  weight: number | null;
  reps: number | null;
  type?: string;
}

export interface WorkoutSession {
  workout_session_id: number;
  user_id: number;
  workout_plan_id: number | null;
  date: string;
  notes?: string;
  duration?: number;
}

export interface WorkoutSessionExercise {
  workout_session_exercise_id: number;
  workout_session_id: number;
  exercise_id: number;
  display_order: number;
}

export interface WorkoutSessionSet {
  workout_session_set_id: number;
  workout_session_exercise_id: number;
  set_number: number;
  weight_used: number;
  reps_completed: number;
  type?: string;
}
