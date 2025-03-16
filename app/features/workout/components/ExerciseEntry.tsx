import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ExerciseEntryProps {
  setNumber: number;
  previous?: string; // Optional field
  reps: number;
  kg: number;
  onMarkComplete: () => void; // Function to mark the set as complete
  isCompleted: boolean; // Whether the set is marked as complete
}

export default function ExerciseEntry({
  setNumber,
  previous = 'None',
  reps,
  kg,
  onMarkComplete,
  isCompleted,
}: ExerciseEntryProps) {
  return (
    <View style={styles.row}>
      {/* Set Number */}
      <Text style={styles.cell}>{setNumber}</Text>

      {/* Previous */}
      <Text style={styles.cell}>{previous}</Text>

      {/* Reps */}
      <Text style={styles.cell}>{reps}</Text>

      {/* KG */}
      <Text style={styles.cell}>{kg}</Text>

      {/* V Symbol (Mark Complete) */}
      <TouchableOpacity onPress={onMarkComplete} style={styles.cell}>
        <Text style={[styles.vSymbol, isCompleted && styles.completed]}>
          {isCompleted ? '✔' : '○'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  vSymbol: {
    fontSize: 16,
    color: '#aaa',
  },
  completed: {
    color: '#28a745', // Green color for completed sets
  },
});