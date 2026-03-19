import React from "react";
import { View, StyleSheet, ViewProps, ViewStyle } from "react-native";
import { useTheme } from "../../context/themeContext";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "outline";
  padding?: "none" | "small" | "medium" | "large";
}

export default function Card({
  children,
  variant = "default",
  padding = "medium",
  style,
  ...props
}: CardProps) {
  const { theme } = useTheme();

  const dynamicStyles = StyleSheet.create({
    base: {
      borderRadius: 16, // Softer curves for modern feel
      backgroundColor: theme.card,
    },
    default: {
      // no extra styles, just for TypeScript
    },
    elevated: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 24,
      elevation: 4, // smoother soft shadow
      borderWidth: 1,
      borderColor: theme.border + "80", // 50% opacity border on elevated cards
    },
    outline: {
      borderWidth: 1,
      borderColor: theme.border,
    },
  });

  const paddingStyles: Record<NonNullable<CardProps["padding"]>, ViewStyle> = {
    none: { padding: 0 },
    small: { padding: 12 },
    medium: { padding: 16 },
    large: { padding: 24 },
  };

  return (
    <View
      style={[
        dynamicStyles.base,
        variant && dynamicStyles[variant],
        padding && paddingStyles[padding],
        style || null,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
