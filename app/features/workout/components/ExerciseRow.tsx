import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ViewStyle,
  TextStyle,
} from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
  LAYOUT,
} from "../../../constants/theme";

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
        <View style={styles.setColumnHeader}>
          <Text style={styles.headerCell}>SET</Text>
        </View>
        <View style={styles.previousColumnHeader}>
          <Text style={styles.headerCell}>PREVIOUS</Text>
        </View>
        <View style={styles.repsColumnHeader}>
          <Text style={styles.headerCell}>REPS</Text>
        </View>
        <View style={styles.kgColumnHeader}>
          <Text style={styles.headerCell}>KG</Text>
        </View>
        <View style={styles.vColumnHeader}>
          <Text style={styles.headerCell}>✔</Text>
        </View>
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
                set.isCompleted && { backgroundColor: COLORS.success },
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

type Styles = {
  exerciseContainer: ViewStyle;
  exerciseName: TextStyle;
  headerRow: ViewStyle;
  headerCell: TextStyle;
  setColumnHeader: ViewStyle;
  previousColumnHeader: ViewStyle;
  repsColumnHeader: ViewStyle;
  kgColumnHeader: ViewStyle;
  vColumnHeader: ViewStyle;
  row: ViewStyle;
  lastRow: ViewStyle;
  cell: TextStyle;
  setColumn: ViewStyle;
  previousColumn: ViewStyle;
  repsColumn: ViewStyle;
  kgColumn: ViewStyle;
  vColumn: ViewStyle;
  inputWrapper: ViewStyle;
  inputCell: TextStyle;
  vSymbol: TextStyle;
  deleteAction: ViewStyle;
  deleteActionText: TextStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
  removeButton: ViewStyle;
  buttonText: TextStyle;
  removeButtonText: TextStyle;
  buttonSpacer: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  exerciseContainer: {
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background.primary,
    ...SHADOWS.small,
    width: "100%",
  },
  exerciseName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
    color: COLORS.text.primary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.primary,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border.primary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.primary,
    borderTopLeftRadius: BORDER_RADIUS.xs,
    borderTopRightRadius: BORDER_RADIUS.xs,
    backgroundColor: COLORS.background.secondary,
  },
  headerCell: {
    textAlign: "center",
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.secondary,
  },
  setColumnHeader: {
    flex: LAYOUT.columns.set,
    alignItems: "center",
  },
  previousColumnHeader: {
    flex: LAYOUT.columns.previous,
    alignItems: "center",
  },
  repsColumnHeader: {
    flex: LAYOUT.columns.reps,
    alignItems: "center",
  },
  kgColumnHeader: {
    flex: LAYOUT.columns.kg,
    alignItems: "center",
  },
  vColumnHeader: {
    flex: LAYOUT.columns.check,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.background.primary,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border.primary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  lastRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.background.primary,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border.primary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
    borderBottomLeftRadius: BORDER_RADIUS.xs,
    borderBottomRightRadius: BORDER_RADIUS.xs,
  },
  cell: {
    textAlign: "center",
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  setColumn: {
    flex: LAYOUT.columns.set,
    alignItems: "center",
  },
  previousColumn: {
    flex: LAYOUT.columns.previous,
    alignItems: "center",
  },
  repsColumn: {
    flex: LAYOUT.columns.reps,
    alignItems: "center",
  },
  kgColumn: {
    flex: LAYOUT.columns.kg,
    alignItems: "center",
  },
  vColumn: {
    flex: LAYOUT.columns.check,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: {
    flex: LAYOUT.columns.reps,
    alignItems: "center",
    paddingHorizontal: SPACING.xs,
  },
  inputCell: {
    width: "100%",
    textAlign: "center",
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
    borderColor: COLORS.border.light,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  vSymbol: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.light,
    textAlign: "center",
    fontWeight: FONT_WEIGHT.bold,
  },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
  },
  deleteActionText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "stretch",
    marginTop: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  removeButton: {
    backgroundColor: COLORS.background.primary,
    borderColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
  removeButtonText: {
    color: COLORS.error,
  },
  buttonSpacer: {
    height: SPACING.sm,
  },
});

export default ExerciseRow;
