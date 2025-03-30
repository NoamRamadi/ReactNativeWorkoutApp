import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useFloatingBanner } from "../context/FloatingBannerContext";
import { useNavigation } from "expo-router";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

export default function FloatingBanner() {
  const { isBannerVisible, hideBanner } = useFloatingBanner();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  if (!isBannerVisible) return null;

  // Navigate back to the Active Workout Screen when the banner is clicked
  const handleBannerPress = () => {
    hideBanner(); // Hide the banner
    console.log(
      "Navigation State:",
      JSON.stringify(navigation.getState(), null, 2)
    );
    navigation.navigate("Workout", { screen: "ActiveWorkout" });
  };

  return (
    <TouchableOpacity style={styles.banner} onPress={handleBannerPress}>
      <Text style={styles.bannerText}>Resume Active Workout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ff4d4d",
    padding: 12,
    borderRadius: 8,
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bannerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
