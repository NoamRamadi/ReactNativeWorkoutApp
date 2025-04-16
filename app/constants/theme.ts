export const COLORS = {
  // Primary colors
  primary: "#6B9BFF",
  primaryLight: "#E6EEFF",

  // Status colors
  success: "#d1e7dd",
  error: "#ff4d4d",
  warning: "#FF9F1C",

  // Set type colors
  warmup: "#FF9F1C",
  dropset: "#9B5DE5",
  failure: "#FF4D6D",

  // Text colors
  text: {
    primary: "#333333",
    secondary: "#666666",
    light: "#999999",
    white: "#FFFFFF",
  },

  // Border colors
  border: {
    light: "#e0e0e0",
    primary: "#6B9BFF",
  },

  // Background colors
  background: {
    primary: "#FFFFFF",
    secondary: "#f5f5f5",
    overlay: "rgba(0, 0, 0, 0.8)",
    overlayLight: "rgba(0, 0, 0, 0.5)",
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 48,
};

export const FONT_WEIGHT = {
  regular: "400",
  medium: "500",
  bold: "700",
} as const;

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const LAYOUT = {
  // Common layout values
  containerPadding: SPACING.md,
  headerHeight: 56,
  bottomTabHeight: 64,

  // Column widths for exercise table (as flex values)
  columns: {
    set: 0.15,
    previous: 0.2,
    reps: 0.25,
    kg: 0.25,
    check: 0.15,
  },
};
