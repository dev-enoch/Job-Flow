import { View, StyleSheet } from "react-native";
import { ClipboardList } from "lucide-react-native";
import Text from "./ui/Text";
import Button from "./ui/Button";
import { useTheme } from "../context/themeContext";
import { MotiView } from "moti";
import { ThemeColors } from "../constants/colors";
import { motion, radius, spacing } from "../constants/design-tokens";

interface EmptyStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  message,
  action,
  icon,
}: EmptyStateProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 90 }}
    >
      <MotiView
        from={{ translateY: 10 }}
        animate={{ translateY: -10 }}
        transition={{
          loop: true,
          type: "timing",
          duration: 2000,
        }}
        style={styles.iconContainer}
      >
        <View style={styles.iconBackground}>
          {icon || <ClipboardList size={54} color={theme.primary} />}
        </View>
      </MotiView>
      <Text variant="h2" weight="bold" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodySmall" color="secondary" align="center" style={styles.message}>
        {message}
      </Text>
      {action && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", delay: 200, duration: motion.slow }}
        >
          <Button
            title={action.label}
            onPress={action.onPress}
            style={styles.button}
          />
        </MotiView>
      )}
    </MotiView>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xxl,
      marginTop: spacing.giant,
    },
    iconContainer: {
      marginBottom: spacing.xxxl,
    },
    iconBackground: {
      width: 120,
      height: 120,
      borderRadius: radius.full,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    },
    title: {
      marginBottom: spacing.md,
      color: theme.text.primary,
    },
    message: {
      marginBottom: spacing.xxxl,
      maxWidth: 280,
    },
    button: {
      minWidth: 180,
      borderRadius: radius.xxl,
    },
  });
