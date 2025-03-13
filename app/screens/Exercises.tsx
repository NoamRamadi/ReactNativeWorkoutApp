import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { initDatabase, addSampleExercises, fetchExercises } from '../../src/database';

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    const initializeAndFetchExercises = async () => {
      try {
        await initDatabase(); // Initialize the database
        await addSampleExercises(); // Add sample exercises if the table is empty
        const result = await fetchExercises(); // Fetch exercises from the database
        setExercises(result); // Update state with fetched data
      } catch (error) {
        console.error('Error initializing or fetching exercises:', error);
      }
    };

    initializeAndFetchExercises();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise List</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.exercise_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text>Body Part: {item.body_part}</Text>
            <Text>Equipment: {item.equipment}</Text>
            <Text>Instruction: {item.instruction}</Text>
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