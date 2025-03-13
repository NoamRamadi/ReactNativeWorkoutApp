import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Workout() {
  const navigation = useNavigation();

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