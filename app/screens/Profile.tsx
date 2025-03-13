import { debugDatabase } from '@/src/database';
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Page</Text>
      <Text>This is where the user profile will be displayed.</Text>
      {/* Debug Button */}
      <Button
        title="Debug Database"
        onPress={() => debugDatabase()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});