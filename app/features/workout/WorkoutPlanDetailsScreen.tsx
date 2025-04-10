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
import { WorkoutStackParamList } from "@/src/types/navigation/navigation.types";
import {
  WorkoutPlan,
  Exercise,
  WorkoutSet,
  GroupedExercise,
  WorkoutPlanDetails,
} from "@/src/types/workout/workout.types";

type WorkoutPlanDetailsRouteProp = RouteProp<
  WorkoutStackParamList,
  "WorkoutPlanDetails"
>;

export default function WorkoutPlanDetailsScreen() {
  const route = useRoute<WorkoutPlanDetailsRouteProp>();
  const { planId } = route.params;
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { setLoadedWorkoutPlan } = useWorkoutContext();

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [groupedExercises, setGroupedExercises] = useState<GroupedExercise[]>(
    []
  );

  useEffect(() => {
    const fetchWorkoutPlanDetails = async () => {
      try {
        const plan = (await getWorkoutPlanDetails(
          planId
        )) as WorkoutPlanDetails[];
        setWorkoutPlan(plan);
      } catch (error) {
        console.error("Failed to fetch workout plan details:", error);
      } finally {
        setIsLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchWorkoutPlanDetails();
  }, [planId]);

  useEffect(() => {
    const fetchWorkoutPlanDetails = async () => {
      try {
        const plan = (await getWorkoutPlanDetails(
          planId
        )) as WorkoutPlanDetails[];

        // Group exercises by exercise_id and display_order
        const grouped = plan?.length
          ? plan.reduce((acc: GroupedExercise[], row: WorkoutPlanDetails) => {
              const uniqueKey = `${row.exercise_id}-${row.display_order}`;

              let exerciseEntry = acc.find((ex) => ex.uniqueKey === uniqueKey);
              if (!exerciseEntry) {
                exerciseEntry = {
                  uniqueKey,
                  exerciseId: row.exercise_id,
                  name: row.exercise_name,
                  bodyPart: row.body_part,
                  equipment: row.equipment,
                  sets: [], // Initialize an empty array for sets
                };
                acc.push(exerciseEntry);
              }

              // Add the set details to the exercise's sets array
              if (row.set_number) {
                exerciseEntry.sets.push({
                  reps: row.planned_reps?.toString() || "",
                  kg: row.planned_weight?.toString() || "",
                  isCompleted: false,
                });
              }

              return acc;
            }, [])
          : [];

        setGroupedExercises(grouped); // Update the local state with grouped exercises
      } catch (error) {
        console.error("Failed to fetch workout plan details:", error);
      } finally {
        setIsLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchWorkoutPlanDetails();
  }, [planId]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!workoutPlan || workoutPlan.length === 0) {
    return <Text>No exercises found for this workout plan.</Text>;
  }

  const planName = workoutPlan[0]?.plan_name;

  const handleStartWorkout = () => {
    setLoadedWorkoutPlan(workoutPlan);
    navigation.navigate("ActiveWorkout");
  };

  return (
    <View style={styles.container}>
      {/* Display the workout plan name */}
      <Text style={styles.title}>{planName}</Text>

      {/* Display Exercises in the Workout Plan */}
      <FlatList
        data={groupedExercises}
        keyExtractor={(item) => item.uniqueKey} // Use the uniqueKey for the key
        renderItem={({ item }) => (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text>Body Part: {item.bodyPart}</Text>
            <Text>Equipment: {item.equipment}</Text>
            {/* Optional: Display the number of sets */}
            <Text>Sets: {item.sets.length}</Text>
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
