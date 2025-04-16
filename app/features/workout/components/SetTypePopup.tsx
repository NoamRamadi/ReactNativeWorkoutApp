import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface SetTypePopupProps {
  position: { top: number; left: number };
  onClose: () => void;
  onSetTypeSelect: (type: "warmup" | "dropset" | "failure") => void;
  onInfoPress: (type: "warmup" | "dropset" | "failure") => void;
}

const setTypeInfo = {
  warmup: {
    letter: "W",
    text: "Warm up",
    color: "#FF9F1C",
  },
  dropset: {
    letter: "D",
    text: "Drop set",
    color: "#9B5DE5",
  },
  failure: {
    letter: "F",
    text: "Failure",
    color: "#FF4D6D",
  },
};

export const SetTypePopup: React.FC<SetTypePopupProps> = ({
  position,
  onClose,
  onSetTypeSelect,
  onInfoPress,
}) => {
  return (
    <View
      style={styles.popupOverlay}
      onTouchStart={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={[
          styles.setTypePopup,
          { position: "absolute", top: position.top, left: position.left },
        ]}
        onPress={(e) => e.stopPropagation()}
      >
        {Object.entries(setTypeInfo).map(([type, info], index) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.popupOption,
              index === Object.keys(setTypeInfo).length - 1 &&
                styles.lastPopupOption,
            ]}
            onPress={() => {
              onSetTypeSelect(type as "warmup" | "dropset" | "failure");
              onClose();
            }}
          >
            <View style={styles.popupOptionContent}>
              <Text style={[styles.popupOptionLetter, { color: info.color }]}>
                {info.letter}
              </Text>
              <Text style={styles.popupOptionText}>{info.text}</Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onInfoPress(type as "warmup" | "dropset" | "failure");
                }}
              >
                <Text style={styles.popupOptionHint}>?</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  setTypePopup: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6B9BFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    minWidth: 176,
  },
  popupOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  popupOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  popupOptionLetter: {
    fontSize: 18,
    fontWeight: "bold",
    width: 24,
    marginLeft: 3,
  },
  popupOptionText: {
    color: "#333",
    fontSize: 15,
    flex: 1,
    fontWeight: "bold",
    marginLeft: 8,
  },
  popupOptionHint: {
    color: "#899",
    fontSize: 25,
    marginLeft: 12,
    width: 40,
    height: 40,
    textAlign: "center",
    fontWeight: "bold",
    textAlignVertical: "center",
    borderRadius: 20,
  },
  lastPopupOption: {
    borderBottomWidth: 0,
  },
});

export default SetTypePopup;
