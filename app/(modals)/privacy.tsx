import { SafeAreaView, StyleSheet, ScrollView, View } from "react-native";
import { useTheme } from "../../context/themeContext";
import { useRouter } from "expo-router";
import Button from "../../components/ui/Button";
import Text from "../../components/ui/Text";
import Card from "../../components/ui/Card";
import { MotiView } from "moti";
import { ShieldCheck, ArrowLeft, Shield } from "lucide-react-native";

export default function PrivacyModal() {
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
        <Text variant="h3" weight="bold" style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={styles.iconContainer}
        >
          <View style={styles.iconCircle}>
            <ShieldCheck size={42} color={theme.success} />
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 100 }}
        >
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.introParagraph}>
              At JobFlow, we take your privacy seriously. This Privacy Policy
              explains our simple and transparent approach: we do not collect or
              store any personal data.
            </Text>

            <View style={styles.sectionHeader}>
              <Shield size={16} color={theme.primary} />
              <Text style={styles.sectionTitle}>1. Data Collection</Text>
            </View>
            <Text style={styles.paragraph}>
              JobFlow does not collect, track, or analyze any personal data, usage
              data, or device metadata. We believe your job search is your private
              business.
            </Text>

            <View style={styles.sectionHeader}>
              <Shield size={16} color={theme.primary} />
              <Text style={styles.sectionTitle}>2. Backups & Data Storage</Text>
            </View>
            <Text style={styles.paragraph}>
              All your job data, including resumes, notes, and tracking history, is
              stored locally on your device. When you choose to back up your data,
              it is saved securely to your own Google Drive account — not ours.
              {"\n\n"}
              This means only you have access to your backup files. JobFlow has no
              visibility or access to any of the files in your Drive.
            </Text>

            <View style={styles.sectionHeader}>
              <Shield size={16} color={theme.primary} />
              <Text style={styles.sectionTitle}>3. No Analytics or Tracking</Text>
            </View>
            <Text style={styles.paragraph}>
              We do not use analytics tools, trackers, or advertising identifiers.
              We simply don’t track anything — no session data, no usage behavior,
              and no personal identifiers.
            </Text>

            <View style={styles.sectionHeader}>
              <Shield size={16} color={theme.primary} />
              <Text style={styles.sectionTitle}>4. Your Control</Text>
            </View>
            <Text style={styles.paragraph}>
              You’re in full control of your data. If you uninstall the app, all
              stored data on your device is removed. Likewise, you can delete
              backups from your Google Drive at any time.
            </Text>

            <View style={styles.sectionHeader}>
              <Shield size={16} color={theme.primary} />
              <Text style={styles.sectionTitle}>5. Contact</Text>
            </View>
            <Text style={styles.paragraph}>
              Questions or feedback? Reach out to us at: support@jobflowapp.com
            </Text>

            <Button
              title="Acknowledge & Close"
              onPress={() => router.back()}
              style={styles.button}
            />
          </Card>
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
      padding: 16,
      paddingBottom: 40,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 16,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.successLight,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.success,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
    card: {
      padding: 20,
    },
    introParagraph: {
      marginBottom: 32,
      color: theme.text.primary,
      lineHeight: 24,
      fontSize: 15,
      textAlign: 'center',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 8,
      gap: 8,
    },
    sectionTitle: {
      fontWeight: "bold",
      color: theme.text.primary,
    },
    paragraph: {
      color: theme.text.secondary,
      lineHeight: 24,
      fontSize: 14,
      paddingLeft: 24,
    },
    button: {
      marginTop: 32,
      borderRadius: 24,
    },
  });
