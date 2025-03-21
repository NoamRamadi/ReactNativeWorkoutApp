import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CustomKeyboardProps {
  onKeyPress: (key: string) => void; // Callback for key press
  onClose: () => void; // Callback to close the keyboard
}

export default function CustomKeyboard({ onKeyPress, onClose }: CustomKeyboardProps) {
  // Generate number buttons dynamically
  const numberButtons = [];
  for (let i = 1; i <= 9; i++) {
    numberButtons.push(
      <TouchableOpacity
        key={i}
        style={styles.keyButton}
        onPress={() => onKeyPress(i.toString())}
      >
        <Text style={styles.keyText}>{i}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.keyboardContainer}>
      {/* First Row */}
      <View style={styles.row}>
        {numberButtons.slice(0, 3)}
      </View>

      {/* Second Row */}
      <View style={styles.row}>
        {numberButtons.slice(3, 6)}
      </View>

      {/* Third Row */}
      <View style={styles.row}>
        {numberButtons.slice(6, 9)}
      </View>

      {/* Fourth Row */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.keyButton}
          onPress={() => onKeyPress('0')}
        >
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.keyButton}
          onPress={() => onKeyPress('delete')} // Trigger delete action
        >
          <Text style={styles.keyText}>⌫</Text>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>↓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  keyButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  keyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#aaa',
  },
});