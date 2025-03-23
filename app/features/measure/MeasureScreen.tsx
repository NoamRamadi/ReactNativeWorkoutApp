import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Measure() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Measurements Page</Text>
      <Text>This is where the user can input body measurements.</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
