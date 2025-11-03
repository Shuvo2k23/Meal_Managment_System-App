export const COLORS = {
  // Primary Colors
  primary: "#FF8C42",
  primaryDark: "#E67A2E",
  primaryLight: "#FFB366",
  
  // Background Colors
  background: "#FFF8F0",
  surface: "#FFFFFF",
  surfaceLight: "#F9F5F0",
  
  // Text Colors
  textPrimary: "#2C1810",
  textSecondary: "#5A3E2B",
  textTertiary: "#8B4513",
  textLight: "#FFFFFF",
  
  // Border Colors
  border: "#E0D6C9",
  borderLight: "#F0E6D6",
  
  // Status Colors
  success: "#10B981",
  successLight: "#C6F6D5",
  error: "#DC2626",
  errorLight: "#FECACA",
  warning: "#F59E0B",
  info: "#3B82F6",
  
  // Neutral Colors
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray700: "#374151",
  gray900: "#111827",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 28,
};

export const FONT_WEIGHTS = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};