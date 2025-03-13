import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens
import Profile from './screens/Profile';
import Measure from './screens/Measure';
import Exercises from './screens/Exercises';
import Workout from './screens/Workout';
import History from './screens/History';
import DatabaseDebugScreen from './screens/DatabaseDebugScreen'; // Import the debug screen

// Create the stack navigator for the Profile and Debug screens
export type ProfileStackParamList = {
  ProfileHome: undefined; // No parameters for this screen
  DatabaseDebug: undefined; // No parameters for this screen
};

const ProfileStack = createStackNavigator<ProfileStackParamList>();

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileHome" component={Profile} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="DatabaseDebug" component={DatabaseDebugScreen} options={{ title: 'Database Debug' }} />
    </ProfileStack.Navigator>
  );
}

// Create the bottom tab navigator
const Tab = createBottomTabNavigator();

export default function RootLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          // Assign icons based on the route name
          switch (route.name) {
            case 'Profile':
              iconName = 'account-circle';
              break;
            case 'Measure':
              iconName = 'ruler';
              break;
            case 'Exercises':
              iconName = 'dumbbell';
              break;
            case 'Workout':
              iconName = 'calendar-clock';
              break;
            case 'History':
              iconName = 'history';
              break;
            default:
              iconName = 'help-circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Hide the header for all tabs
      })}
    >
      {/* Define the tabs */}
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      <Tab.Screen name="Measure" component={Measure} />
      <Tab.Screen name="Exercises" component={Exercises} />
      <Tab.Screen name="Workout" component={Workout} />
      <Tab.Screen name="History" component={History} />
    </Tab.Navigator>
  );
}