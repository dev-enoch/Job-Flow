import { RelativePathString, useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../context/themeContext";
import { ShieldAlert, ArrowLeft } from "lucide-react-native";
import { ThemeColors } from "../constants/colors";
import { MotiView } from "moti";
import Text from "../components/ui/Text";
import Button from "../components/ui/Button";
import {
  motion,
  radius,
  spacing,
} from "../constants/design-tokens";

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  return (
    <>

      <View style={styles.container}>
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          style={styles.iconContainer}
        >
          <View style={styles.iconBackground}>
            <ShieldAlert size={60} color={theme.error} />
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: motion.slow, delay: 100 }}
          style={styles.textContainer}
        >
          <Text variant="display" weight="bold" style={styles.title}>404</Text>
          <Text variant="h3" weight="bold" style={styles.subtitle}>Looks like you're lost in space.</Text>
          <Text variant="body" color="secondary" style={styles.description}>
            The screen you are looking for doesn't exist or has been moved.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: motion.slow, delay: 200 }}
        >
          <Button
            title="Return to Dashboard"
            leftIcon={<ArrowLeft size={20} color={theme.background} />}
            onPress={() => router.replace("/(tabs)/dashboard" as RelativePathString)}
            style={styles.button}
          />
        </MotiView>
      </View>
    </>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xxl,
      backgroundColor: theme.background,
    },
    iconContainer: {
      marginBottom: spacing.xxxl,
    },
    iconBackground: {
      width: 120,
      height: 120,
      borderRadius: radius.full,
      backgroundColor: theme.errorLight,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.error,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 5,
    },
    textContainer: {
      alignItems: "center",
      marginBottom: spacing.huge,
    },
    title: {
      color: theme.error,
      marginBottom: spacing.sm,
    },
    subtitle: {
      color: theme.text.primary,
      marginBottom: spacing.md,
    },
    description: {
      textAlign: "center",
      maxWidth: 280,
    },
    button: {
      minWidth: 220,
      borderRadius: radius.xxl,
    },
  });
