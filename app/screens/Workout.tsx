import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WorkoutStackParamList } from '../_layout'; // Import the type definition
import { StackNavigationProp } from '@react-navigation/stack'; // Import StackNavigationProp

export default function Workout() {
  type WorkoutNavigationProp = StackNavigationProp<WorkoutStackParamList, 'WorkoutHome'>;
  const navigation = useNavigation<WorkoutNavigationProp>();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Plans</Text>
      <Text>This is where your workout plans will be listed.</Text>

      {/* Create New Workout Plan Button */}
      <Button
        title="Create New Workout Plan"
        onPress={() => navigation.navigate('NewWorkoutPlan')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});