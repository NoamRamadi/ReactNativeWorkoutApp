import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function History() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>History Page</Text>
      <Text>This is where the user's completed workouts will be listed.</Text>
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
