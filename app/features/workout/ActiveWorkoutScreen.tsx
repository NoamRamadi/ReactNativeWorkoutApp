import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useFloatingBanner } from "../../../src/context/FloatingBannerContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { WorkoutStackParamList } from "../../_layout"; // Adjust the import path as needed

// Define the type for the navigation prop
type ActiveWorkoutScreenNavigationProp = StackNavigationProp<
  WorkoutStackParamList,
  "ActiveWorkout"
>;

export default function ActiveWorkoutScreen() {
  // Use the typed navigation object
  const navigation = useNavigation<ActiveWorkoutScreenNavigationProp>();
  const { showBanner } = useFloatingBanner();

  // Minimize the screen to a floating banner and navigate back to the start of the stack
  const minimizeToBanner = () => {
    showBanner(); // Show the floating banner
    navigation.popToTop(); // Navigate back to the first screen in the stack
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World</Text>
      <Button title="Minimize" onPress={minimizeToBanner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
