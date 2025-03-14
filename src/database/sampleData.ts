import { Platform } from 'react-native';
import { dbPromise } from './initDatabase';
import { fetchQuery } from './queries';

/**
 * Add sample exercises to the database if the table is empty.
 */
export const addSampleExercises = async () => {
  if (Platform.OS === 'web') {
    console.warn('Adding sample exercises is not supported on the web.');
    return;
  }

  try {
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

    const db = await dbPromise;

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