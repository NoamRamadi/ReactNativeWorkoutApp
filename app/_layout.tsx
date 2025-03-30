import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Import screens
import Profile from "./features/profile/ProfileScreen";
import Measure from "./features/measure/MeasureScreen";
import { NewWorkoutProvider } from "../src/context/NewWorkoutContext";
import Workout from "./features/workout/WorkoutScreen";
import History from "./features/history/HistoryScreen";
import DatabaseDebugScreen from "./debug/DatabaseDebugScreen"; // Import the debug screen
import NewWorkoutPlanScreen from "./features/workout/NewWorkoutPlanScreen"; // Import the new screen
import SelectExerciseScreen from "./features/exercises/SelectExerciseScreen"; // Import the new screen
import ExercisesScreen from "./features/exercises/ExerciseScreen";
import WorkoutPlanDetails from "./features/workout/WorkoutPlanDetails";
import DatabaseManager from "./debug/DatabaseManager";
import { LogBox } from "react-native";
import { FloatingBannerProvider } from "@/src/context/FloatingBannerContext";
import FloatingBanner from "@/src/components/FloatingBanner";
import ActiveWorkoutScreen from "./features/workout/ActiveWorkoutScreen";

// Suppress the specific warning
LogBox.ignoreLogs(["props.pointerEvents is deprecated"]);
// Create the stack navigator for the Profile and Debug screens
export type WorkoutStackParamList = {
  WorkoutHome: undefined; // No parameters for this screen
  NewWorkoutPlan: undefined; // No parameters for this screen
  SelectExercise: undefined;
  WorkoutPlanDetails: { planId: number };
  ActiveWorkout: undefined;
};

// Create the stack navigator for the Workout and NewWorkoutPlan screens
const WorkoutStack = createStackNavigator<WorkoutStackParamList>();

function WorkoutStackNavigator() {
  return (
    <NewWorkoutProvider>
      <WorkoutStack.Navigator>
        <WorkoutStack.Screen
          name="WorkoutHome"
          component={Workout}
          options={{ title: "Workout Plans" }}
        />
        <WorkoutStack.Screen
          name="NewWorkoutPlan"
          component={NewWorkoutPlanScreen}
          options={{ title: "Create New Workout Plan" }}
        />
        <WorkoutStack.Screen
          name="WorkoutPlanDetails"
          component={WorkoutPlanDetails}
        />
        <WorkoutStack.Screen
          name="SelectExercise"
          component={SelectExerciseScreen}
          options={{ title: "Select Exercises" }}
        />
        <WorkoutStack.Screen
          name="ActiveWorkout"
          component={ActiveWorkoutScreen}
          options={{ title: "Active Workout" }}
        />
      </WorkoutStack.Navigator>
    </NewWorkoutProvider>
  );
}

// Create the stack navigator for the Profile and Debug screens
export type ProfileStackParamList = {
  ProfileHome: undefined; // No parameters for this screen
  DatabaseDebug: undefined; // No parameters for this screen
  DatabaseManager: undefined;
};

const ProfileStack = createStackNavigator<ProfileStackParamList>();

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileHome"
        component={Profile}
        options={{ title: "Profile" }}
      />
      <ProfileStack.Screen
        name="DatabaseDebug"
        component={DatabaseDebugScreen}
        options={{ title: "Database Debug" }}
      />
      <ProfileStack.Screen
        name="DatabaseManager"
        component={DatabaseManager}
        options={{ title: "Database Manager" }}
      />
    </ProfileStack.Navigator>
  );
}

// Create the bottom tab navigator
const Tab = createBottomTabNavigator();

export default function RootLayout() {
  return (
    <FloatingBannerProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = "";

            // Assign icons based on the route name
            switch (route.name) {
              case "Profile":
                iconName = "account-circle";
                break;
              case "Measure":
                iconName = "ruler";
                break;
              case "Exercises":
                iconName = "dumbbell";
                break;
              case "Workout":
                iconName = "calendar-clock";
                break;
              case "History":
                iconName = "history";
                break;
              default:
                iconName = "help-circle";
            }

            return (
              <MaterialCommunityIcons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: "#007bff",
          tabBarInactiveTintColor: "gray",
          headerShown: false, // Hide the header for all tabs
        })}
      >
        {/* Define the tabs */}
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
        <Tab.Screen name="Measure" component={Measure} />
        <Tab.Screen name="Exercises" component={ExercisesScreen} />
        <Tab.Screen name="Workout" component={WorkoutStackNavigator} />
        <Tab.Screen name="History" component={History} />
      </Tab.Navigator>
      <FloatingBanner />
    </FloatingBannerProvider>
  );
}
