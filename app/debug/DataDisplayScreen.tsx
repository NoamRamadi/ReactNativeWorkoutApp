import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
//import { initDatabase, executeQuery, fetchQuery } from '../../src/database/database';
import { initDatabase, executeQuery, fetchQuery } from "@/src/database";

export default function DataDisplayScreen() {
  const [users, setUsers] = useState<any[]>([]);

  // Initialize the database and add test data
  useEffect(() => {
    const initializeAndAddData = async () => {
      await initDatabase();

      // Add a test user if the table is empty
      const existingUsers = await fetchQuery("SELECT * FROM Users;");
      if (existingUsers.length === 0) {
        await executeQuery(
          `INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?);`,
          ["test_user", "test@example.com", "hashed_password"]
        );
      }

      // Fetch all users
      const result = await fetchQuery("SELECT * FROM Users;");
      setUsers(result);
    };

    initializeAndAddData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users in the Database</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.user_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text>ID: {item.user_id}</Text>
            <Text>Username: {item.username}</Text>
            <Text>Email: {item.email}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No users found in the database.</Text>}
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  userCard: {
    padding: 12,
    marginVertical: 4,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
});
