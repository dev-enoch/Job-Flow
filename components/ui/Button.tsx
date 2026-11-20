import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";
import Text from "./Text";
import { useTheme } from "../../context/themeContext";
import { getColors } from "../../constants/colors";
import { dimensions, radius, spacing } from "../../constants/design-tokens";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  color?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function Button({
  title,
  variant = "primary",
  size = "medium",
  leftIcon,
  color,
  rightIcon,
  isLoading = false,
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const buttonStyles = [
    styles.base,
    styles[size],
    variant === "primary" && { backgroundColor: colors.action },
    variant === "secondary" && { backgroundColor: colors.secondary },
    variant === "outline" && {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    variant === "ghost" && {
      backgroundColor: "transparent",
    },
    (disabled || isLoading) && { opacity: 0.5 },
    style,
  ];

  const textColor =
    variant === "primary"
      ? colors.onAction
      : variant === "secondary"
      ? colors.primary
      : variant === "outline"
      ? colors.primary
      : variant === "ghost"
      ? colors.text.primary
      : colors.text.disabled;

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      // Visible press feedback; motion tokens run 150–300ms.
      activeOpacity={0.75}
      {...props}
    >
      <View style={styles.content}>
        {leftIcon && !isLoading && (
          <View style={styles.iconLeft}>{leftIcon}</View>
        )}
        {isLoading ? (
          <ActivityIndicator
            color={variant === "primary" ? colors.onAction : colors.primary}
            size="small"
          />
        ) : (
          <Text
            weight="medium"
            color={color ? color : textColor}
            variant={size === "small" ? "label" : "body"}
          >
            {title}
          </Text>
        )}
        {rightIcon && !isLoading && (
          <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  // Heights follow the guide: 44 minimum touch target, 48 standard,
  // 52 large (Android-ideal is 48).
  small: {
    minHeight: dimensions.buttonHeight.small,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  medium: {
    minHeight: dimensions.buttonHeight.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  large: {
    minHeight: dimensions.buttonHeight.large,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
