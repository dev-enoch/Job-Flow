export const lightThemeColors = {
  primary: "#14171a", // Deep slate almost black for primary accents
  primaryLight: "#f1f5f9",
  secondary: "#475569", // Medium slate
  secondaryLight: "#f8fafc",
  accent: "#2563eb", // Vibrant blue accent
  accentLight: "#dbeafe",
  success: "#10b981", // Emerald
  successLight: "#d1fae5",
  warning: "#f59e0b", // Amber
  warningLight: "#fef3c7",
  error: "#ef4444", // Red
  errorLight: "#fee2e2",
  background: "#ffffff", // Pure white for a clean canvas
  card: "#f8fafc", // Very subtle slate for card backgrounds
  border: "#e2e8f0",
  text: {
    primary: "#0f172a", // Dark slate for heavy contrast
    secondary: "#64748b",
    disabled: "#94a3b8",
    white: "#ffffff",
    placeholder: "#cbd5e1",
    error: "#ef4444",
    success: "#10b981",
  },
};

export const darkThemeColors = {
  primary: "#ffffff", // White primary for dark mode
  primaryLight: "#1e293b",
  secondary: "#94a3b8", // Light slate
  secondaryLight: "#0f172a",
  accent: "#3b82f6", // Vibrant blue for dark mode
  accentLight: "#1e3a8a",
  success: "#10b981",
  successLight: "#064e3b",
  warning: "#f59e0b",
  warningLight: "#78350f",
  error: "#ef4444",
  errorLight: "#7f1d1d",
  background: "#020617", // Ultra dark slate
  card: "#0f172a", // Dark slate cards
  border: "#1e293b",
  text: {
    primary: "#f8fafc",
    secondary: "#94a3b8",
    disabled: "#475569",
    white: "#ffffff",
    placeholder: "#475569",
    error: "#f87171",
    success: "#34d399",
  },
};

export const getColors = (isDarkMode: boolean) =>
  isDarkMode ? darkThemeColors : lightThemeColors;

export type ThemeColors = typeof lightThemeColors;
