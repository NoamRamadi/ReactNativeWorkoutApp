import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

interface ExerciseRowProps {
  exercise: {
    name: string;
    sets: Array<{
      reps: string;
      kg: string;
      isCompleted: boolean;
    }>;
  };
  index: number;
  setButtonRefs: React.MutableRefObject<{ [key: string]: any }>;
  onSetPress: (index: number, setIndex: number, buttonRef: any) => void;
  onInputPress: (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "kg"
  ) => void;
  onToggleCompletion: (exerciseIndex: number, setIndex: number) => void;
  onDeleteSet: (exerciseIndex: number, setIndex: number) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
}

const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  index,
  setButtonRefs,
  onSetPress,
  onInputPress,
  onToggleCompletion,
  onDeleteSet,
  onAddSet,
  onRemoveExercise,
}) => {
  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      {/* Table Headers */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.setColumnHeader]}>SET</Text>
        <Text style={[styles.headerCell, styles.previousColumnHeader]}>
          PREVIOUS
        </Text>
        <Text style={[styles.headerCell, styles.repsColumnHeader]}>REPS</Text>
        <Text style={[styles.headerCell, styles.kgColumnHeader]}>KG</Text>
        <Text style={[styles.headerCell, styles.vColumnHeader]}>✔</Text>
      </View>

      {/* Table Rows */}
      {exercise.sets.map((set, setIndex) => {
        const isLastRow = setIndex === exercise.sets.length - 1;
        return (
          <ReanimatedSwipeable
            key={setIndex}
            friction={2}
            rightThreshold={40}
            renderRightActions={() => (
              <TouchableOpacity
                onPress={() => onDeleteSet(index, setIndex)}
                style={styles.deleteAction}
              >
                <Text style={styles.deleteActionText}>Delete</Text>
              </TouchableOpacity>
            )}
          >
            <View
              style={[
                isLastRow ? styles.lastRow : styles.row,
                set.isCompleted && { backgroundColor: "#d1e7dd" },
              ]}
            >
              <TouchableOpacity
                ref={(ref) => {
                  if (ref) {
                    setButtonRefs.current[`${index}-${setIndex}`] = ref;
                  }
                }}
                style={styles.setColumn}
                onPress={() => {
                  const buttonRef =
                    setButtonRefs.current[`${index}-${setIndex}`];
                  if (buttonRef) {
                    onSetPress(index, setIndex, buttonRef);
                  }
                }}
              >
                <Text style={styles.cell}>{setIndex + 1}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.previousColumn]}
                onPress={() => {}}
              >
                <Text>{"place holder"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onInputPress(index, setIndex, "reps")}
                style={[styles.inputWrapper, styles.kgColumn]}
              >
                <TextInput
                  style={[styles.inputCell]}
                  value={set.reps}
                  editable={false}
                  placeholder="Reps"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onInputPress(index, setIndex, "kg")}
                style={styles.inputWrapper}
              >
                <TextInput
                  style={[styles.inputCell]}
                  value={set.kg}
                  editable={false}
                  placeholder="KG"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.vColumn]}
                onPress={() => onToggleCompletion(index, setIndex)}
              >
                <Text style={[styles.vSymbol]}>✔</Text>
              </TouchableOpacity>
            </View>
          </ReanimatedSwipeable>
        );
      })}

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => onAddSet(index)}>
          <Text style={styles.buttonText}>Add Set</Text>
        </TouchableOpacity>
        <View style={styles.buttonSpacer} />
        <TouchableOpacity
          style={[styles.button, styles.removeButton]}
          onPress={() => onRemoveExercise(index)}
        >
          <Text style={[styles.buttonText, styles.removeButtonText]}>
            Remove Exercise
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: "100%",
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#6B9BFF",
    borderLeftWidth: 1,
    borderLeftColor: "#6B9BFF",
    borderRightWidth: 1,
    borderRightColor: "#6B9BFF",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  headerCell: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderLeftColor: "#6B9BFF",
    borderRightWidth: 1,
    borderRightColor: "#6B9BFF",
  },
  lastRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#6B9BFF",
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderLeftColor: "#6B9BFF",
    borderRightWidth: 1,
    borderRightColor: "#6B9BFF",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  cell: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  setColumn: {
    width: "15%",
    justifyContent: "center",
  },
  previousColumn: {
    width: "20%",
    justifyContent: "center",
  },
  repsColumn: {
    width: "25%",
    justifyContent: "center",
  },
  kgColumn: {
    width: "25%",
    justifyContent: "center",
  },
  vColumn: {
    width: "15%",
    justifyContent: "center",
  },
  setColumnHeader: {
    width: "15%",
    justifyContent: "center",
  },
  previousColumnHeader: {
    width: "20%",
    justifyContent: "center",
  },
  repsColumnHeader: {
    width: "25%",
    justifyContent: "center",
  },
  kgColumnHeader: {
    width: "25%",
    justifyContent: "center",
  },
  vColumnHeader: {
    width: "15%",
    justifyContent: "center",
  },
  inputWrapper: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  inputCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    width: "95%",
  },
  vSymbol: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    width: "100%",
    fontWeight: "bold",
  },
  deleteAction: {
    backgroundColor: "#ff4d4d",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
  },
  deleteActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "stretch",
    marginTop: 12,
  },
  button: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6B9BFF",
  },
  removeButton: {
    backgroundColor: "#fff",
    borderColor: "#ff6b6b",
  },
  buttonText: {
    color: "#6B9BFF",
    fontSize: 14,
    fontWeight: "500",
  },
  removeButtonText: {
    color: "#ff6b6b",
  },
  buttonSpacer: {
    height: 8,
  },
});

export default ExerciseRow;
