import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { WorkoutStackParamList } from "../../_layout"; // Import the type definition
import { getAllWorkoutPlans } from "../../../src/database/queries";

export default function Workout() {
  type WorkoutNavigationProp = StackNavigationProp<
    WorkoutStackParamList,
    "WorkoutHome"
  >;
  const navigation = useNavigation<WorkoutNavigationProp>();

  // State to store workout plans
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);

  // Fetch workout plans from the database
  // Fetch workout plans from the database
  const fetchWorkoutPlans = async () => {
    try {
      const plans = await getAllWorkoutPlans();
      setWorkoutPlans(plans); // Update state with fetched workout plans
    } catch (error) {
      console.error("Failed to fetch workout plans:", error);
    }
  };

  // Use useFocusEffect to re-fetch data whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchWorkoutPlans(); // Fetch data when the screen is focused
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Plans</Text>

      {/* Display List of Workout Plans */}
      {workoutPlans.length > 0 ? (
        <FlatList
          data={workoutPlans}
          keyExtractor={(item) => item.workout_plan_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.workoutPlanItem}
              onPress={() => console.log("click")}
            >
              <Text style={styles.workoutPlanName}>{item.plan_name}</Text>
              <Text style={styles.workoutPlanDetails}>
                Created: {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text>No workout plans available. Create one now!</Text>
      )}

      {/* Create New Workout Plan Button */}
      <Button
        title="Create New Workout Plan"
        onPress={() => navigation.navigate("NewWorkoutPlan")}
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
    fontWeight: "bold",
    marginBottom: 16,
  },
  workoutPlanItem: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 8,
    borderRadius: 8,
  },
  workoutPlanName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  workoutPlanDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
