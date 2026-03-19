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
import { LogOut, X } from "lucide-react-native";
import Text from "./ui/Text";
import Button from "./ui/Button";

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
              {/* Dismiss handle */}
              <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
                <X size={18} color={theme.text.secondary} />
              </TouchableOpacity>

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
                  style={styles.cancelBtn}
                />
                <Button
                  title="Log Out"
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
      marginBottom: 32,
      lineHeight: 22,
      maxWidth: 300,
      fontSize: 15,
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
