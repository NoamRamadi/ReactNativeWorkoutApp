import { Platform } from 'react-native';
import { dbPromise } from './initDatabase';

/**
 * Execute a SQL query with optional parameters.
 */
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  if (Platform.OS === 'web') {
    throw new Error('SQLite is not supported on the web platform.');
  }

  try {
    const db = await dbPromise;
    const result = await db?.runAsync(query, params);

    return {
      insertId: result?.lastInsertRowId || undefined,
      rowsAffected: result?.changes || undefined,
    };
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

/**
 * Fetch data from the database using a SQL query.
 */
export const fetchQuery = async (query: string, params: any[] = []): Promise<any[]> => {
  if (Platform.OS === 'web') {
    throw new Error('SQLite is not supported on the web platform.');
  }

  try {
    const db = await dbPromise;
    const rows = await db?.getAllAsync(query, params);
    return rows || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

/**
 * Fetch all exercises from the database.
 */
export const fetchExercises = async (): Promise<any[]> => {
  if (Platform.OS === 'web') {
    throw new Error('SQLite is not supported on the web platform.');
  }

  try {
    const db = await dbPromise;
    const rows = await db?.getAllAsync('SELECT * FROM Exercises;');
    return rows || [];
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

export const getAllWorkoutPlans = async () => {
  try {
    // Query the database for all workout plans
    const db = await dbPromise;
    const result = await db?.getAllAsync('SELECT * FROM WorkoutPlans;');
    return result || [] ;
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    throw error;
  }
};