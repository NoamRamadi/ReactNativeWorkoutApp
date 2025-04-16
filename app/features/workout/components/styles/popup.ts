import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from "../../../../constants/theme";

type PopupStyles = {
  setTypePopup: ViewStyle;
  popupOverlay: ViewStyle;
  popupOption: ViewStyle;
  popupOptionContent: ViewStyle;
  popupOptionLetter: TextStyle;
  warmupLetter: TextStyle;
  dropsetLetter: TextStyle;
  failureLetter: TextStyle;
  popupOptionText: TextStyle;
  popupOptionHint: TextStyle;
  lastPopupOption: ViewStyle;
  infoPopupOverlay: ViewStyle;
  infoPopup: ViewStyle;
  infoPopupContent: ViewStyle;
  infoPopupTitle: TextStyle;
  infoPopupText: TextStyle;
  infoPopupCloseButton: ViewStyle;
  infoPopupCloseText: TextStyle;
};

export const popupStyles = StyleSheet.create<PopupStyles>({
  setTypePopup: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
    zIndex: 1000,
    minWidth: 176,
  },
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  popupOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  popupOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  popupOptionLetter: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    width: 24,
  },
  warmupLetter: {
    color: COLORS.warmup,
  },
  dropsetLetter: {
    color: COLORS.dropset,
  },
  failureLetter: {
    color: COLORS.failure,
  },
  popupOptionText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZE.sm,
    flex: 1,
    marginLeft: SPACING.md,
  },
  popupOptionHint: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.xxl,
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.error,
    width: 40,
    height: 35,
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: BORDER_RADIUS.xs,
  },
  lastPopupOption: {
    borderBottomWidth: 0,
  },
  infoPopupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background.overlayLight,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  },
  infoPopup: {
    width: "80%",
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  infoPopupContent: {
    alignItems: "center",
  },
  infoPopupTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
    color: COLORS.text.primary,
    textAlign: "center",
  },
  infoPopupText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  infoPopupCloseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  infoPopupCloseText: {
    color: COLORS.text.white,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.sm,
  },
});
