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

    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
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

    // Add more tables here as needed
    // Example:
    // const workouts = await fetchQuery('SELECT * FROM Workouts;');
    // console.log('Workouts in the database:', workouts);
  } catch (error) {
    console.error('Error debugging database:', error);
  }
};