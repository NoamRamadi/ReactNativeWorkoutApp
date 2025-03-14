import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Open the SQLite database and store the resolved SQLiteDatabase object
const dbPromise = Platform.OS === 'web'
  ? null
  : SQLite.openDatabaseAsync('./../assets/WorkoutTracker.db');

/**
 * Initialize the database and create tables if they don't exist.
 */
export const initDatabase = async () => {
  if (Platform.OS === 'web') {
    console.warn('SQLite is not supported on the web platform.');
    return;
  }

  try {
    const db = await dbPromise;

    // Create Users table
    await db?.execAsync(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Exercises table
    await db?.execAsync(`
      CREATE TABLE IF NOT EXISTS Exercises (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        body_part TEXT NOT NULL,
        equipment TEXT NOT NULL,
        profile_picture TEXT NOT NULL DEFAULT '',
        form_picture TEXT NOT NULL DEFAULT '',
        instruction TEXT NOT NULL DEFAULT ''
      );
    `);

    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

/**
 * Add sample exercises to the database if the table is empty.
 */
export const addSampleExercises = async () => {
  if (Platform.OS === 'web') {
    console.warn('Adding sample exercises is not supported on the web.');
    return;
  }

  try {
    const db = await dbPromise;

    // Check if the table is empty
    const existingExercises = await fetchQuery('SELECT * FROM Exercises;');
    if (existingExercises.length > 0) {
      console.log('Exercises already exist in the database.');
      return;
    }

    // Insert sample exercises
    const sampleExercises = [
      {
        name: 'Push-Ups',
        body_part: 'Chest',
        equipment: 'Bodyweight',
        profile_picture: '',
        form_picture: '',
        instruction: 'Perform push-ups by lowering your body until your chest nearly touches the ground.',
      },
      {
        name: 'Squats',
        body_part: 'Legs',
        equipment: 'Bodyweight',
        profile_picture: '',
        form_picture: '',
        instruction: 'Stand with feet shoulder-width apart and lower your hips back and down.',
      },
      {
        name: 'Bicep Curls',
        body_part: 'Arms',
        equipment: 'Dumbbell',
        profile_picture: '',
        form_picture: '',
        instruction: 'Hold dumbbells and curl them toward your shoulders.',
      },
      {
        name: 'Deadlifts',
        body_part: 'Back',
        equipment: 'Barbell',
        profile_picture: '',
        form_picture: '',
        instruction: 'Lift the barbell from the ground to hip level while keeping your back straight.',
      },
      {
        name: 'Plank',
        body_part: 'Core',
        equipment: 'Bodyweight',
        profile_picture: '',
        form_picture: '',
        instruction: 'Hold a straight-body position with your forearms on the ground and core engaged.',
      },
      {
        name: 'Lunges',
        body_part: 'Legs',
        equipment: 'Bodyweight',
        profile_picture: '',
        form_picture: '',
        instruction: 'Step forward with one leg and lower your hips until both knees are bent at 90 degrees.',
      },
      {
        name: 'Shoulder Press',
        body_part: 'Shoulders',
        equipment: 'Dumbbell',
        profile_picture: '',
        form_picture: '',
        instruction: 'Press dumbbells overhead while keeping your core tight.',
      },
      {
        name: 'Pull-Ups',
        body_part: 'Back',
        equipment: 'Pull-Up Bar',
        profile_picture: '',
        form_picture: '',
        instruction: 'Hang from the bar and pull yourself up until your chin is above the bar.',
      },
      {
        name: 'Calf Raises',
        body_part: 'Legs',
        equipment: 'Bodyweight',
        profile_picture: '',
        form_picture: '',
        instruction: 'Stand on your toes and raise your heels as high as possible.',
      },
      {
        name: 'Russian Twists',
        body_part: 'Core',
        equipment: 'Medicine Ball',
        profile_picture: '',
        form_picture: '',
        instruction: 'Sit on the ground, lean back slightly, and twist your torso side to side while holding a medicine ball.',
      },
    ];


    for (const exercise of sampleExercises) {
      await db?.runAsync(
        `
          INSERT INTO Exercises (name, body_part, equipment, profile_picture, form_picture, instruction)
          VALUES (?, ?, ?, ?, ?, ?);
        `,
        [
          exercise.name,
          exercise.body_part,
          exercise.equipment,
          exercise.profile_picture,
          exercise.form_picture,
          exercise.instruction,
        ]
      );
    }

    console.log('Sample exercises added to the database.');
  } catch (error) {
    console.error('Error adding sample exercises:', error);
  }
};


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

/**
 * Debugging: Log the contents of the database tables.
 */
export const debugDatabase = async () => {
  if (Platform.OS === 'web') {
    console.warn('Debugging the database is not supported on the web.');
    return;
  }

  try {
    const users = await fetchQuery('SELECT * FROM Users;');
    console.log('Users in the database:\n\n', users);

    const exercises = await fetchQuery('SELECT * FROM Exercises;');
    console.log('Exercises in the database:\n\n', exercises);
  } catch (error) {
    console.error('Error debugging database:', error);
  }
};