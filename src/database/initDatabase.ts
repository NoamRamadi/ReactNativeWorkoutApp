import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Open the SQLite database and store the resolved SQLiteDatabase object
export const dbPromise = Platform.OS === 'web'
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