import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface InfoPopupProps {
  title: string;
  message: string;
  onClose: () => void;
}

export const InfoPopup: React.FC<InfoPopupProps> = ({
  title,
  message,
  onClose,
}) => {
  return (
    <View style={styles.infoPopupOverlay}>
      <View style={styles.infoPopup}>
        <View style={styles.infoPopupContent}>
          <Text style={styles.infoPopupTitle}>{title}</Text>
          <Text style={styles.infoPopupText}>{message}</Text>
          <TouchableOpacity
            style={styles.infoPopupCloseButton}
            onPress={onClose}
          >
            <Text style={styles.infoPopupCloseText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoPopupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  },
  infoPopup: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoPopupContent: {
    alignItems: "center",
  },
  infoPopupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
    textAlign: "center",
  },
  infoPopupText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  infoPopupCloseButton: {
    backgroundColor: "#6B9BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  infoPopupCloseText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default InfoPopup;
