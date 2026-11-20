import { StyleSheet, ScrollView, Linking, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/themeContext";
import { useRouter } from "expo-router";
import Button from "../../components/ui/Button";
import Text from "../../components/ui/Text";
import Card from "../../components/ui/Card";
import ScreenHeader from "../../components/ui/ScreenHeader";
import { MotiView } from "moti";
import { BriefcaseIcon, Heart, Globe, Twitter } from "lucide-react-native";
import {
  dimensions,
  motion,
  radius,
  spacing,
} from "../../constants/design-tokens";

export default function AboutModal() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  return (
    // Root layout owns the top inset; this modal owns the bottom one.
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScreenHeader title="About JobFlow" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={styles.logoContainer}
        >
          <View style={styles.logoCircle}>
            <BriefcaseIcon size={42} color={theme.background} />
          </View>
          <Text variant="h1" weight="bold" style={styles.appName}>JobFlow</Text>
          <Text variant="caption" color="secondary" style={styles.version}>Version 1.0.0</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", delay: 100, duration: motion.slow }}
        >
          <Card variant="elevated" style={styles.card}>
            <Text variant="bodySmall" color="secondary">
              JobFlow is a smart and intuitive job application tracker designed to
              simplify and streamline the job search process. Built with a focus on
              usability and privacy, it helps users stay organized, motivated, and
              in control of their career journey.
            </Text>
            <View style={styles.divider} />
            <Text variant="bodySmall" color="secondary">
              With JobFlow, you can easily log new job applications, monitor their
              progress, and keep track of important milestones such as interviews,
              follow-ups, and outcomes — all in one central location.
            </Text>
          </Card>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", delay: 200, duration: motion.slow }}
        >
          <Card variant="outline" style={styles.featureCard}>
            <View style={styles.featureRow}>
              <Globe size={24} color={theme.primary} />
              <View style={styles.featureText}>
                <Text weight="bold">Privacy First</Text>
                <Text variant="caption" color="secondary">Operates entirely offline with optional secure Google Drive backup.</Text>
              </View>
            </View>
          </Card>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", delay: 300, duration: motion.slow }}
          style={styles.footer}
        >
          <Text variant="caption" color="secondary" style={styles.footerText}>
            Developed with <Heart size={14} color={theme.error} /> by IRIS LABS
          </Text>

          <Button
            title="Follow us on X"
            leftIcon={<Twitter size={18} color={theme.background} />}
            onPress={() => Linking.openURL("https://x.com/earhyel")}
            style={styles.twitterButton}
          />
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      padding: dimensions.screenPadding,
      paddingBottom: spacing.xxxl,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
      marginTop: spacing.xl,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: radius.full,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    appName: {
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    version: {
      letterSpacing: 1,
    },
    card: {
      marginBottom: spacing.lg,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: spacing.lg,
    },
    featureCard: {
      marginBottom: spacing.xxxl,
      padding: dimensions.cardPadding,
      backgroundColor: theme.primaryLight + "30",
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    featureText: {
      flex: 1,
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    footerText: {
      marginBottom: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    twitterButton: {
      width: '100%',
      borderRadius: radius.xxl,
      backgroundColor: theme.primary,
    },
  });
