//import { debugDatabase } from '@/src/database/database';
import { debugDatabase } from "@/src/database";

import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { ProfileStackParamList } from "../../_layout"; // Import the type definition
import { StackNavigationProp } from "@react-navigation/stack"; // Import StackNavigationProp

// Define the type for the navigation prop
type ProfileScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  "ProfileHome"
>;

export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>(); // Type the navigation object

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Page</Text>
      <Text>This is where the user profile will be displayed.</Text>

      {/* Debug Button */}
      <Button title="Debug Database" onPress={() => debugDatabase()} />

      {/* Navigate to Database Debug Screen */}
      <Button
        title="Go to Database Debug Screen"
        onPress={() => navigation.navigate("DatabaseDebug")} // Now works without errors
      />

      <Button
        title="Debug: Database Manager"
        onPress={() => navigation.navigate("DatabaseManager")}
      />
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
