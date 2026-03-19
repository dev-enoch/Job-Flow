import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "../context/themeContext";
import { MotiView } from "moti";
import { Trash2, X } from "lucide-react-native";
import Text from "./ui/Text";
import Button from "./ui/Button";

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <MotiView
              from={{ opacity: 0, scale: 0.92, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              style={styles.sheet}
            >
              {/* Close button */}
              <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
                <X size={18} color={theme.text.secondary} />
              </TouchableOpacity>

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
                <Text variant="caption" style={styles.warningText}>
                  ⚠️  All notes, follow-up dates, and contact info will be lost.
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Keep It"
                  variant="outline"
                  onPress={onDismiss}
                  style={styles.cancelBtn}
                />
                <Button
                  title="Delete"
                  onPress={onConfirm}
                  style={[styles.confirmBtn, { backgroundColor: theme.error }]}
                />
              </View>
            </MotiView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 40,
      alignItems: "center",
    },
    closeBtn: {
      alignSelf: "flex-end",
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.errorLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      shadowColor: theme.error,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 4,
    },
    title: {
      marginBottom: 10,
      color: theme.text.primary,
    },
    message: {
      marginBottom: 16,
      lineHeight: 22,
      maxWidth: 300,
      fontSize: 15,
    },
    warningStrip: {
      width: "100%",
      backgroundColor: theme.warningLight,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 28,
    },
    warningText: {
      color: theme.warning,
      lineHeight: 18,
    },
    actions: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    cancelBtn: {
      flex: 1,
      borderRadius: 20,
    },
    confirmBtn: {
      flex: 1,
      borderRadius: 20,
    },
  });
