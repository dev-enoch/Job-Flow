import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../context/themeContext";
import { LogOut, X } from "lucide-react-native";
import Text from "./ui/Text";
import Button from "./ui/Button";
import BottomSheet from "./ui/BottomSheet";
import IconButton from "./ui/IconButton";
import { radius, spacing } from "../constants/design-tokens";

interface LogoutDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}

export default function LogoutDialog({
  visible,
  onDismiss,
  onConfirm,
}: LogoutDialogProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <View style={styles.content}>
        {/* Dismiss handle */}
        <IconButton variant="filled" size={36} onPress={onDismiss} style={styles.closeBtn}>
          <X size={18} color={theme.text.secondary} />
        </IconButton>

        {/* Icon */}
        <View style={styles.iconCircle}>
          <LogOut size={32} color={theme.error} />
        </View>

        {/* Text */}
        <Text variant="h3" weight="bold" align="center" style={styles.title}>
          Log Out?
        </Text>
        <Text color="secondary" align="center" style={styles.message}>
          Are you sure you want to log out of your account? You'll need to sign in again to access your data.
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onDismiss}
            style={styles.actionBtn}
          />
          <Button
            title="Log Out"
            onPress={onConfirm}
            style={[styles.actionBtn, { backgroundColor: theme.error }]}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    content: {
      alignItems: "center",
    },
    closeBtn: {
      alignSelf: "flex-end",
      marginBottom: spacing.lg,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: radius.full,
      backgroundColor: theme.errorLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.xl,
      shadowColor: theme.error,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 4,
    },
    title: {
      marginBottom: spacing.sm,
      color: theme.text.primary,
    },
    message: {
      marginBottom: spacing.xxxl,
      lineHeight: 22,
      maxWidth: 300,
      fontSize: 15,
    },
    actions: {
      flexDirection: "row",
      gap: spacing.md,
      width: "100%",
    },
    actionBtn: {
      flex: 1,
      borderRadius: radius.xl,
    },
  });
