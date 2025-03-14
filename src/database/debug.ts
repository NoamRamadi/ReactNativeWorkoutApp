import { Platform } from 'react-native';
import { fetchQuery } from './queries';

/**
 * Debugging: Log the contents of the database tables.
 */
export const debugDatabase = async () => {
  if (Platform.OS === 'web') {
    console.warn('Debugging the database is not supported on the web.');
    return;
  }

  try {
    // Fetch and log users
    const users = await fetchQuery('SELECT * FROM Users;');
    console.log('Users in the database:\n\n', users);

    // Fetch and log exercises
    const exercises = await fetchQuery('SELECT * FROM Exercises;');
    console.log('Exercises in the database:\n\n', exercises);
  } catch (error) {
    console.error('Error debugging database:', error);
  }
};