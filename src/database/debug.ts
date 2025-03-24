import { Platform } from "react-native";
import { fetchQuery } from "./queries";

/**
 * Debugging: Log the contents of the database tables.
 */
export const debugDatabase = async () => {
  if (Platform.OS === "web") {
    console.warn("Debugging the database is not supported on the web.");
    return;
  }

  try {
    // Fetch and log users
    const users = await fetchQuery("SELECT * FROM Users;");
    console.log("Users in the database:\n\n", users);

    // Fetch and log exercises
    const exercises = await fetchQuery("SELECT * FROM Exercises;");
    console.log("Exercises in the database:\n\n", exercises);

    const workoutPlans = await fetchQuery("SELECT * FROM WorkoutPlans;");
    console.log("workoutPlans in the database:\n\n", workoutPlans);

    const WorkoutPlanExercises = await fetchQuery(
      "SELECT * FROM WorkoutPlanExercises;"
    );
    console.log(
      "WorkoutPlanExercises in the database:\n\n",
      WorkoutPlanExercises
    );

    const WorkoutPlanSets = await fetchQuery("SELECT * FROM WorkoutPlanSets;");
    console.log("WorkoutPlanSets in the database:\n\n", WorkoutPlanSets);

    const WorkoutSessions = await fetchQuery("SELECT * FROM WorkoutSessions;");
    console.log("WorkoutSessions in the database:\n\n", WorkoutSessions);

    const WorkoutSessionExercises = await fetchQuery(
      "SELECT * WorkoutSessionExercises;"
    );
    console.log(
      "WorkoutSessionExercises in the database:\n\n",
      WorkoutSessionExercises
    );

    const WorkoutSessionSets = await fetchQuery(
      "SELECT * FROM WorkoutSessionSets;"
    );
    console.log("WorkoutSessionSets in the database:\n\n", WorkoutSessionSets);
  } catch (error) {
    console.error("Error debugging database:", error);
  }
};
