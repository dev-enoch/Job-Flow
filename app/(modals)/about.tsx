import { SafeAreaView, StyleSheet, ScrollView, Linking, View } from "react-native";
import { useTheme } from "../../context/themeContext";
import { useRouter } from "expo-router";
import Button from "../../components/ui/Button";
import Text from "../../components/ui/Text";
import Card from "../../components/ui/Card";
import { MotiView } from "moti";
import { BriefcaseIcon, Heart, Globe, Twitter, ArrowLeft } from "lucide-react-native";

export default function AboutModal() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Button
          variant="outline"
          title=""
          leftIcon={<ArrowLeft size={20} color={theme.text.primary} />}
          onPress={() => router.back()}
          style={styles.backBtn}
        />
        <Text variant="h3" weight="bold" style={styles.headerTitle}>About JobFlow</Text>
        <View style={{ width: 40 }} />
      </View>
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
          <Text variant="h2" weight="bold" style={styles.appName}>JobFlow</Text>
          <Text variant="caption" color="secondary" style={styles.version}>Version 1.0.0</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", delay: 100, duration: 500 }}
        >
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.paragraph}>
              JobFlow is a smart and intuitive job application tracker designed to
              simplify and streamline the job search process. Built with a focus on
              usability and privacy, it helps users stay organized, motivated, and
              in control of their career journey.
            </Text>
            <View style={styles.divider} />
            <Text style={styles.paragraph}>
              With JobFlow, you can easily log new job applications, monitor their
              progress, and keep track of important milestones such as interviews,
              follow-ups, and outcomes — all in one central location.
            </Text>
          </Card>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", delay: 200, duration: 500 }}
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
          transition={{ type: "timing", delay: 300, duration: 500 }}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border + "50",
    },
    backBtn: {
      width: 44,
      height: 44,
      paddingHorizontal: 0,
      justifyContent: 'center',
      borderRadius: 22,
    },
    headerTitle: {
      color: theme.text.primary,
    },
    container: {
      padding: 24,
      paddingBottom: 40,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
      marginTop: 20,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    appName: {
      fontSize: 28,
      color: theme.text.primary,
      marginBottom: 4,
    },
    version: {
      letterSpacing: 1,
    },
    card: {
      marginBottom: 16,
    },
    paragraph: {
      color: theme.text.secondary,
      lineHeight: 24,
      fontSize: 15,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 16,
    },
    featureCard: {
      marginBottom: 32,
      padding: 20,
      backgroundColor: theme.primaryLight + "30",
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    featureText: {
      flex: 1,
    },
    footer: {
      alignItems: 'center',
      marginTop: 20,
    },
    footerText: {
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    twitterButton: {
      width: '100%',
      borderRadius: 24,
      backgroundColor: theme.primary,
    },
  });
