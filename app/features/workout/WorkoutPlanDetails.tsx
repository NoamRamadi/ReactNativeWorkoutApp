import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { getWorkoutPlanDetails } from "../../../src/database/queries";
import { useWorkoutContext } from "../../../src/context/WorkoutContext";
import { WorkoutStackParamList } from "@/app/_layout";

type WorkoutPlanDetailsRouteProp = RouteProp<
  WorkoutStackParamList,
  "WorkoutPlanDetails"
>;

export default function WorkoutPlanDetails() {
  const route = useRoute<WorkoutPlanDetailsRouteProp>();
  const { planId } = route.params;
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { setActiveWorkout } = useWorkoutContext(); // Access the workout context

  // State to hold the workout plan details
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWorkoutPlanDetails = async () => {
      try {
        const plan = await getWorkoutPlanDetails(planId);
        console.log("Fetched Plan:", plan); // Debugging: Log the fetched data
        setWorkoutPlan(plan); // Update state with the fetched plan
      } catch (error) {
        console.error("Failed to fetch workout plan details:", error);
      } finally {
        setIsLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchWorkoutPlanDetails();
  }, [planId]);

  // Handle loading state
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Handle empty data case
  if (!workoutPlan || workoutPlan.length === 0) {
    return <Text>No exercises found for this workout plan.</Text>;
  }

  // Extract the plan name from the first object in the array
  const planName = workoutPlan[0]?.plan_name;

  // Function to handle starting the workout
  const handleStartWorkout = () => {
    setActiveWorkout(workoutPlan); // Load the workout plan into the context
    navigation.navigate("ActiveWorkout"); // Navigate to the Active Workout screen
  };

  return (
    <View style={styles.container}>
      {/* Display the workout plan name */}
      <Text style={styles.title}>{planName}</Text>

      {/* Display Exercises in the Workout Plan */}
      <FlatList
        data={workoutPlan}
        keyExtractor={(item, index) => `${item.exercise_id}-${index}`} // Ensure unique keys
        renderItem={({ item }) => (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseName}>{item.exercise_name}</Text>
            <Text>Body Part: {item.body_part}</Text>
            <Text>Equipment: {item.equipment}</Text>
          </View>
        )}
      />
      {/* Start Workout Button */}
      <Button title="START WORKOUT" onPress={handleStartWorkout} />
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
    fontWeight: "bold",
    marginBottom: 16,
  },
  exerciseContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
