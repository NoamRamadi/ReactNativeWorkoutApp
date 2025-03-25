import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { executeQuery, fetchQuery } from "../../src/database/queries";

// Define the list of tables and their primary keys
const TABLES = [
  { name: "Users", primaryKey: "user_id" },
  { name: "WorkoutPlans", primaryKey: "workout_plan_id" },
  { name: "WorkoutPlanExercises", primaryKey: "workout_plan_exercise_id" },
  { name: "WorkoutPlanSets", primaryKey: "workout_plan_set_id" },
  { name: "WorkoutSessions", primaryKey: "workout_session_id" },
  {
    name: "WorkoutSessionExercises",
    primaryKey: "workout_session_exercise_id",
  },
  { name: "WorkoutSessionSets", primaryKey: "workout_session_set_id" },
  { name: "Exercises", primaryKey: "exercise_id" },
];

export default function DatabaseManager() {
  const [tables, setTables] = useState<any[]>([]); // Stores table names and their rows

  // Fetch all rows for each table
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const tablesWithData = await Promise.all(
          TABLES.map(async ({ name, primaryKey }) => {
            try {
              const dataResult = await fetchQuery(`SELECT * FROM ${name};`, []);
              console.log("dataResult for table:", name, dataResult);

              // Use the dataResult directly as rows
              return {
                tableName: name,
                primaryKey, // Store the primary key for later use
                rows: Array.isArray(dataResult) ? dataResult : [], // Ensure rows is always an array
              };
            } catch (error) {
              console.error(`Error fetching data for table ${name}:`, error);
              return {
                tableName: name,
                primaryKey,
                rows: [], // Return empty rows if there's an error
              };
            }
          })
        );

        setTables(tablesWithData);
      } catch (error) {
        console.error("Error fetching database tables:", error);
        Alert.alert("Error", "Failed to fetch database tables.");
      }
    };

    fetchTableData();
  }, []);

  // Handle row deletion
  const handleDeleteRow = async (
    tableName: string,
    primaryKey: string,
    rowId: number
  ) => {
    try {
      console.log(rowId, "row");
      // Use the primary key column for deletion
      await executeQuery(`DELETE FROM ${tableName} WHERE ${primaryKey} = ?;`, [
        rowId,
      ]);
      Alert.alert("Success", "Row deleted successfully.");

      // Refresh the table data after deletion
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.tableName === tableName
            ? {
                ...table,
                rows: table.rows.filter(
                  (row: { [key: string]: number }) => row[primaryKey] !== rowId
                ),
              }
            : table
        )
      );
    } catch (error) {
      console.error("Error deleting row:", error);
      Alert.alert("Error", "Failed to delete row.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Manager</Text>

      {/* Display Tables */}
      <FlatList
        data={tables}
        keyExtractor={(item) => item.tableName}
        renderItem={({ item }) => (
          <View style={styles.tableContainer}>
            <Text style={styles.tableName}>{item.tableName}</Text>

            {/* Display Rows */}
            {item.rows.length > 0 ? (
              <FlatList
                data={item.rows}
                keyExtractor={(row) =>
                  row[item.primaryKey]?.toString() || Math.random().toString()
                }
                renderItem={({ item: row }) => (
                  <View style={styles.rowContainer}>
                    <Text>{JSON.stringify(row, null, 2)}</Text>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        handleDeleteRow(
                          item.tableName,
                          item.primaryKey,
                          row[item.primaryKey]
                        )
                      }
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <Text>No rows in this table.</Text>
            )}
          </View>
        )}
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tableContainer: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  tableName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  rowContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 8,
    borderRadius: 4,
    marginTop: 8, // Ensures spacing between text and button
    alignSelf: "flex-start", // Aligns the button to the start for better aesthetics
  },

  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
