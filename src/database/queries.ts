import { Platform } from "react-native";
import { dbPromise } from "./initDatabase";

/**
 * Execute a SQL query with optional parameters.
 */
export const executeQuery = async (
  query: string,
  params: any[] = []
): Promise<any> => {
  if (Platform.OS === "web") {
    throw new Error("SQLite is not supported on the web platform.");
  }

  try {
    const db = await dbPromise;
    const result = await db?.runAsync(query, params);

    return {
      insertId: result?.lastInsertRowId || undefined,
      rowsAffected: result?.changes || undefined,
    };
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};

/**
 * Fetch data from the database using a SQL query.
 */
export const fetchQuery = async (
  query: string,
  params: any[] = []
): Promise<any[]> => {
  if (Platform.OS === "web") {
    throw new Error("SQLite is not supported on the web platform.");
  }

  try {
    const db = await dbPromise;
    const rows = await db?.getAllAsync(query, params);
    return rows || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

/**
 * Fetch all exercises from the database.
 */
export const fetchExercises = async (): Promise<any[]> => {
  if (Platform.OS === "web") {
    throw new Error("SQLite is not supported on the web platform.");
  }

  try {
    const db = await dbPromise;
    const rows = await db?.getAllAsync("SELECT * FROM Exercises;");
    return rows || [];
  } catch (error) {
    console.error("Error fetching exercises:", error);
    throw error;
  }
};

export const getAllWorkoutPlans = async () => {
  try {
    // Query the database for all workout plans
    const db = await dbPromise;
    const result = await db?.getAllAsync("SELECT * FROM WorkoutPlans;");
    return result || [];
  } catch (error) {
    console.error("Error fetching workout plans:", error);
    throw error;
  }
};

export const getWorkoutPlanDetails = async (planId: number) => {
  try {
    const db = await dbPromise;

    // Fetch exercises associated with the workout plan
    const planResult = await db?.getAllAsync(
      `SELECT 
    wp.workout_plan_id,
    wp.plan_name,
    wp.created_at,
    e.exercise_id,
    e.name AS exercise_name,
    e.body_part,
    e.equipment,
    wps.set_number,
    wps.weight AS planned_weight,
    wps.reps AS planned_reps,
    wpe.display_order
FROM 
    WorkoutPlans wp
JOIN 
    WorkoutPlanExercises wpe ON wp.workout_plan_id = wpe.workout_plan_id
JOIN 
    Exercises e ON wpe.exercise_id = e.exercise_id
LEFT JOIN 
    WorkoutPlanSets wps ON wpe.workout_plan_exercise_id = wps.workout_plan_exercise_id
WHERE 
    wp.workout_plan_id = ?;`,
      [planId]
    );

    return planResult;
  } catch (error) {
    console.error("Error fetching workout plan details:", error);
    throw error;
  }
};
