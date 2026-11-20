import {
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import Text from "../../components/ui/Text";
import ScreenHeader from "../../components/ui/ScreenHeader";
import {
  Bell,
  ChevronRight,
  CloudDownload,
  CloudUpload,
  FileText,
  Info,
  LogOut,
  MessageSquarePlus,
  Moon,
  Lock,
  Star,
  CheckCircle,
} from "lucide-react-native";
import { useState } from "react";
import Card from "../../components/ui/Card";
import { useTheme } from "../../context/themeContext";
import { Link, useRouter } from "expo-router";
import { MotiView } from "moti";
import { ThemeColors } from "../../constants/colors";
import { useAuth } from "../../context/authContext";
import LogoutDialog from "../../components/logout-modal";
import Button from "../../components/ui/Button";
import {
  dimensions,
  motion,
  radius,
  spacing,
} from "../../constants/design-tokens";

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  disabled = false,
}: SettingItemProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.disabledItem]}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text weight="medium" style={disabled ? styles.disabledText : {}}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color={disabled ? "disabled" : "secondary"}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement ||
        (onPress && !disabled && (
          <ChevronRight size={20} color={theme.text.secondary} />
        ))}
      {disabled && <Lock size={16} color={theme.text.disabled} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const styles = createStyles(theme);
  const [notifications, setNotifications] = useState(true);
  const router = useRouter();
  const { signOut, loading, signIn, user, isPremium, upgradeToPremium } = useAuth();

  const [logutDialogue, setLogoutDialogue] = useState(false);

  return (
    // Root layout already provides the top safe-area inset.
    <View style={styles.container}>
      <ScreenHeader title="Settings" />

      <ScrollView style={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 100, damping: 15 }}
        >
          <Card variant="elevated" style={styles.profileCard}>
            <View style={styles.profileHeader}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text variant="body" color="secondary" style={styles.loadingText}>Loading profile...</Text>
                </View>
              ) : user ? (
                <>
                  <Image
                    source={{
                      uri:
                        user.photo ||
                        "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg",
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.profileInfo}>
                    <Text variant="h2" weight="bold" style={styles.name}>
                      {user.name}
                    </Text>
                    <Text variant="label" color="secondary">
                      {user.email}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.loginContainer}>
                  <Text variant="body" style={styles.loginText}>
                    You're not logged in.
                  </Text>
                  <Button
                    title="Continue with Google"
                    variant="primary"
                    onPress={signIn}
                    leftIcon={
                      <Image
                        source={require("../../assets/icons/google-icon.png")}
                        style={styles.googleIcon}
                      />
                    }
                    disabled={loading}
                    style={styles.loginButton}
                  />
                </View>
              )}
            </View>
          </Card>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: motion.slow, delay: 200 }}
        >
          {!isPremium ? (
            <Card variant="elevated" style={styles.proCard}>
              <View style={styles.proCardHeader}>
                <Star size={20} color={theme.primary} style={styles.proCardIcon} />
                <Text variant="h3" weight="bold" color="primary">Upgrade to Pro</Text>
              </View>
              <Text variant="body" color="primary" style={styles.proCardText}>
                Get unlimited job tracking and permanently remove all ads for a one-time payment.
              </Text>
              <Button title="Upgrade Now - $4.99" onPress={upgradeToPremium} />
            </Card>
          ) : (
            <Card variant="outline" style={styles.proMemberCard}>
              <CheckCircle size={24} color={theme.success} style={styles.proMemberIcon} />
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold">Pro Member</Text>
                <Text variant="caption" color="secondary">You have lifetime access to all features.</Text>
              </View>
            </Card>
          )}
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: motion.slow, delay: 300 }}
        >
          <Text
            variant="h4"
            weight="medium"
            color="secondary"
            style={styles.sectionTitle}
          >
            Data Management
          </Text>

          <View style={styles.dataManagementContainer}>
            <Card variant="outline" style={styles.card}>
              <SettingItem
                icon={<CloudUpload size={20} color={theme.primary} />}
                title="Backup"
                subtitle="Export a JSON file or sync to Google Drive"
                onPress={() => router.push("/(modals)/backup")}
              />

              <SettingItem
                icon={<CloudDownload size={20} color={theme.primary} />}
                title="Restore from Backup"
                subtitle="Import a JSON file or recover from Drive"
                onPress={() => router.push("/(modals)/restore")}
              />
            </Card>
            {!user && (
              <Text variant="caption" color="secondary" style={styles.dataHint}>
                Local JSON backup and restore work without signing in. Google Drive backup needs a Google sign-in.
              </Text>
            )}
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: motion.slow, delay: 400 }}
        >
          <Card variant="outline" style={styles.card}>
            <Text
              variant="label"
              weight="medium"
              color="secondary"
              style={styles.sectionTitle}
            >
              Preferences
            </Text>
            <SettingItem
              icon={<Bell size={20} color={theme.primary} />}
              title="Notifications"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: theme.border, true: theme.primaryLight }}
                  thumbColor={notifications ? theme.primary : theme.surfaceElevated}
                />
              }
            />
            <SettingItem
              icon={<Moon size={20} color={theme.primary} />}
              title="Dark Mode"
              rightElement={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.border, true: theme.primaryLight }}
                  thumbColor={isDarkMode ? theme.primary : theme.surfaceElevated}
                />
              }
            />
          </Card>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: motion.slow, delay: 500 }}
        >
          <Text
            variant="h4"
            weight="medium"
            color="secondary"
            style={styles.sectionTitle}
          >
            Help & Support
          </Text>

          <Card variant="outline" style={styles.card}>
            <Link href="/(modals)/feature-request" asChild>
              <SettingItem
                icon={<MessageSquarePlus size={20} color={theme.primary} />}
                title="Request a Feature"
                subtitle="Suggest new functionality"
              />
            </Link>

            <Link href="/(modals)/privacy" asChild>
              <SettingItem
                icon={<FileText size={20} color={theme.primary} />}
                title="Privacy Policy"
                subtitle="Read our privacy policy"
              />
            </Link>

            <Link href="/(modals)/about" asChild>
              <SettingItem
                icon={<Info size={20} color={theme.primary} />}
                title="About the App"
                subtitle="Version 1.0.0"
              />
            </Link>
          </Card>

          {user && (
            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: motion.slow, delay: 600 }}
            >
              <Text
                variant="h4"
                weight="medium"
                color="secondary"
                style={styles.sectionTitle}
              >
                Account
              </Text>

              <Card variant="outline" style={styles.card}>
                <SettingItem
                  icon={<LogOut size={20} color={theme.error} />}
                  title="Log Out"
                  subtitle="Sign out of your account"
                  onPress={() => setLogoutDialogue(true)}
                />
              </Card>
            </MotiView>
          )}
        </MotiView>

        <View style={styles.footer}>
          <Text variant="caption" color="secondary" align="center">
            © 2025 Job Tracker. All rights reserved.
          </Text>
        </View>
      </ScrollView>
      <LogoutDialog
        visible={logutDialogue}
        onDismiss={() => setLogoutDialogue(false)}
        onConfirm={() => {
          setLogoutDialogue(false);
          signOut();
        }}
      />
    </View>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: dimensions.screenPadding,
    },
    sectionTitle: {
      marginTop: dimensions.sectionGap,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    card: {
      marginBottom: spacing.sm,
    },
    proCard: {
      backgroundColor: theme.primaryLight,
      padding: dimensions.cardPadding,
      marginBottom: dimensions.sectionGap,
    },
    proCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    proCardIcon: {
      marginRight: spacing.sm,
    },
    proCardText: {
      marginBottom: spacing.lg,
    },
    proMemberCard: {
      padding: dimensions.cardPadding,
      marginBottom: dimensions.sectionGap,
      flexDirection: "row",
      alignItems: "center",
    },
    proMemberIcon: {
      marginRight: spacing.md,
    },
    dataManagementContainer: {
      position: "relative",
    },
    dataHint: {
      marginTop: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuItemContent: {
      flex: 1,
      marginLeft: spacing.md,
    },
    footer: {
      marginVertical: spacing.xxl,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      // Minimum 44px touch target for every settings row.
      minHeight: dimensions.minTouchTarget,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    disabledItem: {
      opacity: 0.6,
    },
    disabledText: {
      color: theme.text.disabled,
    },
    settingIcon: {
      marginRight: spacing.md,
      width: spacing.xxl,
      alignItems: "center",
    },
    settingContent: {
      flex: 1,
    },
    profileCard: {
      padding: dimensions.cardPadding,
      backgroundColor: theme.surface,
      marginBottom: dimensions.sectionGap,
      marginTop: spacing.lg,
    },
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: radius.full,
      marginRight: spacing.lg,
      borderWidth: 2,
      borderColor: theme.border,
    },
    profileInfo: {
      flex: 1,
    },
    name: {
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
      padding: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.md,
      color: theme.text.secondary,
    },
    loginContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loginText: {
      marginBottom: spacing.sm,
      color: theme.text.secondary,
    },
    loginButton: {
      alignSelf: "center",
    },
    googleIcon: {
      width: 18,
      height: 18,
      marginRight: spacing.sm,
    },
  });
