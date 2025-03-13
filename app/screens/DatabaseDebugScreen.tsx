import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import { fetchQuery, executeQuery } from '../../src/database';

export default function DatabaseDebugScreen() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newBodyPart, setNewBodyPart] = useState('');
  const [newEquipment, setNewEquipment] = useState('');

  // Fetch exercises from the database
  const loadExercises = async () => {
    try {
      const result = await fetchQuery('SELECT * FROM Exercises;');
      setExercises(result);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  // Add a new exercise
  const addExercise = async () => {
    if (!newExerciseName || !newBodyPart || !newEquipment) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      await executeQuery(
        `
          INSERT INTO Exercises (name, body_part, equipment, profile_picture, form_picture, instruction)
          VALUES (?, ?, ?, '', '', '');
        `,
        [newExerciseName, newBodyPart, newEquipment]
      );
      setNewExerciseName('');
      setNewBodyPart('');
      setNewEquipment('');
      loadExercises(); // Refresh the list
      alert('Exercise added successfully!');
    } catch (error) {
      console.error('Error adding exercise:', error);
      alert('Failed to add exercise.');
    }
  };

  // Delete an exercise
  const deleteExercise = async (exerciseId: number) => {
    try {
      await executeQuery('DELETE FROM Exercises WHERE exercise_id = ?;', [exerciseId]);
      loadExercises(); // Refresh the list
      alert('Exercise deleted successfully!');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Debug Screen</Text>

      {/* Add New Exercise Form */}
      <TextInput
        style={styles.input}
        placeholder="Exercise Name"
        value={newExerciseName}
        onChangeText={setNewExerciseName}
      />
      <TextInput
        style={styles.input}
        placeholder="Body Part"
        value={newBodyPart}
        onChangeText={setNewBodyPart}
      />
      <TextInput
        style={styles.input}
        placeholder="Equipment"
        value={newEquipment}
        onChangeText={setNewEquipment}
      />
      <Button title="Add Exercise" onPress={addExercise} />

      {/* List of Exercises */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.exercise_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exerciseCard}
            onLongPress={() => deleteExercise(item.exercise_id)} // Long press to delete
          >
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text>Body Part: {item.body_part}</Text>
            <Text>Equipment: {item.equipment}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No exercises found in the database.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  exerciseCard: {
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});