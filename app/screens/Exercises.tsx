import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { initDatabase, addSampleExercises, fetchExercises } from '../../src/database';

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [allExercises, setAllExercises] = useState<any[]>([]); // Stores all exercises for filtering and sorting
  const [isSearchVisible, setIsSearchVisible] = useState(false); // Controls search bar visibility
  const [searchQuery, setSearchQuery] = useState(''); // Stores the search query
  const [isSortMenuVisible, setIsSortMenuVisible] = useState(false); // Controls sort menu visibility
  const [sortOption, setSortOption] = useState<'name' | 'body_part'>('name'); // Selected sort option

  useEffect(() => {
    const initializeAndFetchExercises = async () => {
      try {
        await initDatabase(); // Initialize the database
        await addSampleExercises(); // Add sample exercises if the table is empty
        const result = await fetchExercises(); // Fetch exercises from the database
        setExercises(result); // Update state with fetched data
        setAllExercises(result); // Store all exercises for filtering and sorting
      } catch (error) {
        console.error('Error initializing or fetching exercises:', error);
      }
    };

    initializeAndFetchExercises();
  }, []);

  // Handle search query changes
  const handleSearch = (text: string) => {
    setSearchQuery(text);

    // Filter exercises based on the search query
    const filteredExercises = allExercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(text.toLowerCase())
    );
    setExercises(filteredExercises);
  };

  // Toggle search bar visibility
  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setSearchQuery(''); // Clear search query when closing the search bar
      setExercises(allExercises); // Reset exercises list
    }
  };

  // Sort exercises based on the selected option
  const handleSort = (option: 'name' | 'body_part') => {
    setSortOption(option);
    setIsSortMenuVisible(false); // Hide the sort menu after selecting an option

    // Sort the exercises array
    const sortedExercises = [...exercises].sort((a, b) => {
      if (option === 'name') {
        return a.name.localeCompare(b.name); // Sort alphabetically by name
      } else if (option === 'body_part') {
        return a.body_part.localeCompare(b.body_part); // Sort alphabetically by body part
      }
      return 0;
    });

    setExercises(sortedExercises);
  };

  return (
    <View style={styles.container}>
      {/* Header with Title and Buttons */}
      <View style={styles.header}>
        <Text style={styles.title}>Exercise List</Text>
        <View style={styles.buttonsContainer}>
          {/* Search Button */}
          <TouchableOpacity onPress={toggleSearch} style={styles.iconButton}>
            <MaterialCommunityIcons
              name={isSearchVisible ? 'close' : 'magnify'}
              size={24}
              color="#007bff"
            />
          </TouchableOpacity>

          {/* Sort Button */}
          <TouchableOpacity
            onPress={() => setIsSortMenuVisible(!isSortMenuVisible)}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons name="sort" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort Menu */}
      {isSortMenuVisible && (
        <View style={styles.sortMenu}>
          <TouchableOpacity
            style={styles.sortMenuItem}
            onPress={() => handleSort('name')}
          >
            <Text>Sort by Name</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortMenuItem}
            onPress={() => handleSort('body_part')}
          >
            <Text>Sort by Body Part</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      {isSearchVisible && (
        <TextInput
          style={styles.searchBar}
          placeholder="Search exercises..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      )}

      {/* Exercise List */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.exercise_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text>Body Part: {item.body_part}</Text>
            <Text>Equipment: {item.equipment}</Text>
            <Text>Instruction: {item.instruction}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No exercises found in the database.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  sortMenu: {
    position: 'absolute',
    top: 50, // Position below the header
    right: 16, // Align with the sort button
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  sortMenuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  exerciseCard: {
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});