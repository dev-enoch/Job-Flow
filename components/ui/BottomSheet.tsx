import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "../../context/themeContext";
import Text from "./Text";
import IconButton from "./IconButton";
import {
  motion,
  radius,
  spacing,
} from "../../constants/design-tokens";

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Bottom-sheet dialog (filters, actions, confirmations).
 * - Top radius 20–28, drag handle, safe-area bottom padding.
 * - Backdrop tap or the close button dismisses.
 * - Enter animation runs inside the 150–300ms motion scale.
 */
export default function BottomSheet({
  visible,
  onDismiss,
  title,
  children,
}: BottomSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
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
              from={{ opacity: 0, translateY: 40 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: motion.slow }}
              style={[
                styles.sheet,
                { paddingBottom: insets.bottom + spacing.lg },
              ]}
            >
              <View style={styles.handle} />
              {title ? (
                <View style={styles.titleRow}>
                  <Text variant="h3" weight="bold" style={styles.title}>
                    {title}
                  </Text>
                  <IconButton variant="filled" size={36} onPress={onDismiss}>
                    <X size={18} color={theme.text.secondary} />
                  </IconButton>
                </View>
              ) : null}
              {children}
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
      backgroundColor: theme.surface,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: theme.divider,
      alignSelf: "center",
      marginBottom: spacing.lg,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    title: {
      flex: 1,
      color: theme.text.primary,
    },
  });
