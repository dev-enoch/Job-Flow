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
  // Semantic aliases (design tokens): same values, clearer intent.
  // `action` is the primary action colour — it aliases `primary` so the
  // app's near-black brand button is preserved.
  surface: "#f8fafc",
  surfaceElevated: "#ffffff",
  divider: "#e2e8f0",
  action: "#14171a",
  onAction: "#ffffff",
  muted: "#6b7280",
  mutedLight: "#f3f4f6",
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
  // Semantic aliases (design tokens) — see the light theme above.
  surface: "#0f172a",
  surfaceElevated: "#1e293b",
  divider: "#1e293b",
  action: "#ffffff",
  onAction: "#0f172a",
  muted: "#9ca3af",
  mutedLight: "#1f2937",
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
