import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { popupStyles } from "./styles/popup";

interface InfoPopupProps {
  title: string;
  message: string;
  onClose: () => void;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ title, message, onClose }) => {
  return (
    <View style={popupStyles.infoPopupOverlay}>
      <View style={popupStyles.infoPopup}>
        <View style={popupStyles.infoPopupContent}>
          <Text style={popupStyles.infoPopupTitle}>{title}</Text>
          <Text style={popupStyles.infoPopupText}>{message}</Text>
          <TouchableOpacity
            style={popupStyles.infoPopupCloseButton}
            onPress={onClose}
          >
            <Text style={popupStyles.infoPopupCloseText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default InfoPopup;
