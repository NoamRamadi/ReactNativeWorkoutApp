import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useFloatingBanner } from "../../../src/context/FloatingBannerContext";

export default function ActiveWorkoutScreen() {
  const { showBanner } = useFloatingBanner();

  // Minimize the screen to a floating banner
  const minimizeToBanner = () => {
    showBanner(); // Show the floating banner
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
