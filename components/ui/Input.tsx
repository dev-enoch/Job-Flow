import { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Platform,
} from "react-native";
import Text from "./Text";
import { useTheme } from "../../context/themeContext";
import {
  dimensions,
  radius,
  spacing,
} from "../../constants/design-tokens";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  value,
  leftIcon,
  rightIcon,
  style,
  placeholder,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="label" color="secondary" style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            !!leftIcon && styles.inputWithLeftIcon,
            !!rightIcon && styles.inputWithRightIcon,
            style || null,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.text.placeholder}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && (
        <Text variant="caption" color="error" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const createStyles = (theme: any) => {
  return StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    label: {
      marginBottom: spacing.sm,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.lg,
      backgroundColor: theme.background,
    },
    inputFocused: {
      borderColor: theme.primary,
    },
    inputError: {
      borderColor: theme.error,
    },
    input: {
      flex: 1,
      // Guide: input height 48–52 (50 standard); web keeps its 40.
      height: Platform.OS === "web" ? 40 : dimensions.inputHeight,
      color: theme.text.primary,
      paddingHorizontal: spacing.md,
      fontSize: 16,
      fontFamily: "Inter-Regular",
    },
    inputWithLeftIcon: {
      paddingLeft: spacing.sm,
    },
    inputWithRightIcon: {
      paddingRight: spacing.sm,
    },
    leftIcon: {
      paddingLeft: spacing.md,
    },
    rightIcon: {
      paddingRight: spacing.md,
    },
    error: {
      marginTop: spacing.xs,
    },
  });
};
