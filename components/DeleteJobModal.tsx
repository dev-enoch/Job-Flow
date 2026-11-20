import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../context/themeContext";
import { Trash2, TriangleAlert } from "lucide-react-native";
import Text from "./ui/Text";
import Button from "./ui/Button";
import BottomSheet from "./ui/BottomSheet";
import IconButton from "./ui/IconButton";
import { X } from "lucide-react-native";
import { radius, spacing } from "../constants/design-tokens";

interface DeleteJobDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}

export default function DeleteJobDialogue({
  visible,
  onDismiss,
  onConfirm,
}: DeleteJobDialogProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <View style={styles.content}>
        {/* Close button */}
        <IconButton variant="filled" size={36} onPress={onDismiss} style={styles.closeBtn}>
          <X size={18} color={theme.text.secondary} />
        </IconButton>

        {/* Danger icon */}
        <View style={styles.iconCircle}>
          <Trash2 size={32} color={theme.error} />
        </View>

        {/* Text */}
        <Text variant="h3" weight="bold" align="center" style={styles.title}>
          Delete Application?
        </Text>
        <Text color="secondary" align="center" style={styles.message}>
          This job application will be permanently removed. This action{" "}
          <Text weight="bold" style={{ color: theme.error }}>
            cannot be undone.
          </Text>
        </Text>

        {/* Danger warning strip */}
        <View style={styles.warningStrip}>
          <TriangleAlert size={16} color={theme.warning} />
          <Text variant="caption" style={styles.warningText}>
            All notes, follow-up dates, and contact info will be lost.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Keep It"
            variant="outline"
            onPress={onDismiss}
            style={styles.actionBtn}
          />
          <Button
            title="Delete"
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
      marginBottom: spacing.lg,
      lineHeight: 22,
      maxWidth: 300,
      fontSize: 15,
    },
    warningStrip: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: theme.warningLight,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xxl,
    },
    warningText: {
      flex: 1,
      color: theme.warning,
      lineHeight: 18,
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
