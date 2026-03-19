import { RelativePathString, useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../context/themeContext";
import { ShieldAlert, ArrowLeft } from "lucide-react-native";
import { ThemeColors } from "../constants/colors";
import { MotiView } from "moti";
import Text from "../components/ui/Text";
import Button from "../components/ui/Button";

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
          transition={{ type: "timing", duration: 500, delay: 100 }}
          style={styles.textContainer}
        >
          <Text style={styles.title}>404</Text>
          <Text style={styles.subtitle}>Looks like you're lost in space.</Text>
          <Text style={styles.description}>
            The screen you are looking for doesn't exist or has been moved.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
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
      padding: 24,
      backgroundColor: theme.background,
    },
    iconContainer: {
      marginBottom: 32,
    },
    iconBackground: {
      width: 120,
      height: 120,
      borderRadius: 60,
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
      marginBottom: 40,
    },
    title: {
      fontSize: 48,
      fontWeight: "800",
      color: theme.error,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text.primary,
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: "center",
      maxWidth: 280,
      lineHeight: 24,
    },
    button: {
      minWidth: 220,
      borderRadius: 30,
    },
  });
