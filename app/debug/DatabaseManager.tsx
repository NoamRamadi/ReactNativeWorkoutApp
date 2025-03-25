import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { executeQuery, fetchQuery } from "../../src/database/queries";

const TABLES = [
  "Users",
  "WorkoutPlans",
  "WorkoutPlanExercises",
  "WorkoutSessions",
  "WorkoutSessionSets",
  "Exercises",
  "WorkoutPlanSets",
  "WorkoutSessionExercises",
];

export default function DatabaseManager() {
  const [tables, setTables] = useState<any[]>([]); // Stores table names and their rows

  // Fetch all rows for each table
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const tablesWithData = await Promise.all(
          TABLES.map(async (tableName) => {
            try {
              const dataResult = await fetchQuery(
                `SELECT * FROM ${tableName};`,
                []
              );
              console.log("dataResult for table:", tableName, dataResult);

              // Use the dataResult directly as rows
              return {
                tableName,
                rows: Array.isArray(dataResult) ? dataResult : [], // Ensure rows is always an array
              };
            } catch (error) {
              console.error(
                `Error fetching data for table ${tableName}:`,
                error
              );
              return {
                tableName,
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
  const handleDeleteRow = async (tableName: string, rowId: number) => {
    try {
      // Assuming every table has an `id` column as the primary key
      await executeQuery(
        `DELETE FROM ${tableName} WHERE workout_plan_id = ?;`,
        [rowId]
      );
      Alert.alert("Success", "Row deleted successfully.");

      // Refresh the table data after deletion
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.tableName === tableName
            ? {
                ...table,
                rows: table.rows.filter(
                  (row: { id: number }) => row.id !== rowId
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
                  row.id?.toString() || Math.random().toString()
                }
                renderItem={({ item: row }) => (
                  <View style={styles.rowContainer}>
                    <Text>{JSON.stringify(row)}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRow(item.tableName, row.id)}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
