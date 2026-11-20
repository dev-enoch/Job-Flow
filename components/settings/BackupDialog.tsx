import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useTheme } from "../../context/themeContext";
import Text from "../../components/ui/Text";
import Button from "../../components/ui/Button";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThemeColors } from "../../constants/colors";
import { CloudUpload, Smartphone, HardDrive, Clock, Cloud, Database, ShieldCheck, Share2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/authContext";
import { useBackup } from "../../utils/backup";
import { useJobs } from "../../context/jobContext";
import { MotiView } from "moti";
import logger from "../../utils/logger";
import {
  dimensions,
  motion,
  radius,
  spacing,
} from "../../constants/design-tokens";

export default function BackupDialog() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const { jobs } = useJobs();
  const { exportLocalBackup, getLastLocalBackupDate, createBackup, getBackupInfo } = useBackup();

  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  const [backupSize, setBackupSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [driveBackupInfo, setDriveBackupInfo] = useState<any>(null);
  const [exportingLocal, setExportingLocal] = useState(false);
  const [uploadingToDrive, setUploadingToDrive] = useState(false);

  useEffect(() => {
    const prepareBackup = async () => {
      setLoading(true);
      try {
        const lastdate = await getLastLocalBackupDate();
        setLastBackupDate(lastdate);

        if (user) {
          const driveInfo = await getBackupInfo();
          setDriveBackupInfo(driveInfo);
        }
      } catch (error) {
        logger.error("Error preparing backup:", error);
        Toast.show({
          type: "error",
          text1: "Backup Error",
          text2: "An error occurred while preparing the backup.",
        });
      } finally {
        setLoading(false);
      }
    };

    prepareBackup();
  }, [user]);

  const handleLocalBackup = async () => {
    try {
      setExportingLocal(true);
      // Writes jobflow_backup.json from SQLite and opens the share sheet
      // so the file can be saved or sent anywhere. Works offline.
      const result = await exportLocalBackup();
      setBackupSize(result.size);
      const now = new Date();
      setLastBackupDate(now);

      Toast.show({
        type: "success",
        text1: "Backup Shared",
        text2: `${result.jobCount} application${result.jobCount === 1 ? "" : "s"} exported to jobflow_backup.json.`,
      });
    } catch (error) {
      logger.error("Error creating local backup:", error);
      Toast.show({
        type: "error",
        text1: "Backup Error",
        text2: (error as Error).message || "Failed to create local backup.",
      });
    } finally {
      setExportingLocal(false);
    }
  };

  const handleDriveBackup = async () => {
    if (!user) return;

    try {
      setUploadingToDrive(true);
      // Jobs are read from SQLite inside createBackup.
      const success = await createBackup();

      if (success) {
        const driveInfo = await getBackupInfo();
        setDriveBackupInfo(driveInfo);

        Toast.show({
          type: "success",
          text1: "Backup Successful",
          text2: "Backup uploaded to Google Drive successfully.",
        });
      } else {
        throw new Error("Backup failed");
      }
    } catch (error) {
      logger.error("Error uploading to Google Drive:", error);
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: "Failed to upload backup to Google Drive.",
      });
    } finally {
      setUploadingToDrive(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDriveDate = (isoString: string | undefined) => {
    if (!isoString) return "Never";
    return formatDistanceToNow(new Date(isoString), { addSuffix: true });
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => {
    return (
      <View style={styles.infoRow}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.infoContent}>
          <Text variant="caption" color="secondary">{label}</Text>
          <Text variant="body" weight="bold">{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: motion.slow }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <ShieldCheck size={32} color={theme.primary} />
          </View>
          <Text variant="h2" weight="bold" style={styles.title}>
            Backup Options
          </Text>
          <Text variant="bodySmall" color="secondary" style={styles.paragraph} align="center">
            Safely store your job application data as a JSON file or in your Google Drive
            account to never lose your career progress.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ marginTop: 12 }} color="secondary">Preparing sync state...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Database size={24} color={theme.text.primary} />
                <Text variant="h3" weight="bold" style={styles.sectionTitle}>
                  Local Backup (JSON file)
                </Text>
              </View>
              <View style={styles.cardContent}>
                <InfoRow
                  icon={<Clock size={18} color={theme.primary} />}
                  label="Last Backup"
                  value={lastBackupDate ? formatDistanceToNow(lastBackupDate, { addSuffix: true }) : "Never"}
                />
                <InfoRow
                  icon={<HardDrive size={18} color={theme.primary} />}
                  label="Last Export Size"
                  value={formatFileSize(backupSize)}
                />
                <InfoRow
                  icon={<Database size={18} color={theme.primary} />}
                  label="Applications"
                  value={`${jobs.length} on this device`}
                />
                <Button
                  title={exportingLocal ? "Preparing..." : "Export JSON Backup"}
                  leftIcon={exportingLocal ? undefined : <Share2 size={18} color={theme.background} />}
                  onPress={handleLocalBackup}
                  isLoading={exportingLocal}
                  style={styles.button}
                />
                <Text variant="caption" color="secondary" style={styles.hintText}>
                  Opens the share sheet so you can save jobflow_backup.json to Files, Drive, email or anywhere else. No sign-in needed.
                </Text>
              </View>
            </View>

            {user ? (
              <View style={[styles.section, { borderColor: theme.primary, borderWidth: 2 }]}>
                <View style={styles.sectionHeader}>
                  <Cloud size={24} color={theme.primary} />
                  <Text variant="h3" weight="bold" color="primary" style={styles.sectionTitle}>
                    Google Drive Backup
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <InfoRow
                    icon={<Clock size={18} color={theme.primary} />}
                    label="Last Cloud Backup"
                    value={formatDriveDate(driveBackupInfo?.lastUpdated)}
                  />
                  <InfoRow
                    icon={<HardDrive size={18} color={theme.primary} />}
                    label="Cloud Storage Used"
                    value={formatFileSize(driveBackupInfo?.size)}
                  />
                  <InfoRow
                    icon={<Smartphone size={18} color={theme.primary} />}
                    label="Stored Device"
                    value={driveBackupInfo?.device || "Unknown device"}
                  />
                  <Button
                    title={uploadingToDrive ? "Uploading..." : "Sync to Google Drive"}
                    leftIcon={uploadingToDrive ? undefined : <CloudUpload size={18} color={theme.background} />}
                    onPress={handleDriveBackup}
                    isLoading={uploadingToDrive}
                    style={styles.button}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Cloud size={24} color={theme.text.disabled} />
                  <Text variant="h3" weight="bold" color="secondary" style={styles.sectionTitle}>
                    Google Drive Backup
                  </Text>
                </View>
                <View style={[styles.cardContent, { alignItems: 'center', paddingVertical: 12 }]}>
                  <Text color="secondary" align="center" style={{ marginBottom: 16 }}>
                    Sign in with Google to enable secure cloud backups and cross-device sync.
                  </Text>
                  <Button variant="outline" title="Sign In Required" disabled={true} />
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </MotiView>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      alignItems: "center",
      padding: spacing.xxl,
      paddingTop: spacing.xxl,
    },
    headerIcon: {
      width: spacing.display,
      height: spacing.display,
      borderRadius: radius.full,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    title: {
      marginBottom: spacing.sm,
      color: theme.text.primary,
    },
    paragraph: {
      maxWidth: "90%",
    },
    loadingBox: {
      padding: spacing.huge,
      justifyContent: "center",
      alignItems: "center",
    },
    section: {
      marginHorizontal: dimensions.screenPadding,
      marginBottom: dimensions.sectionGap,
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      shadowColor: theme.text.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: dimensions.cardPadding,
      backgroundColor: theme.primaryLight + "30",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionTitle: {
      marginLeft: spacing.md,
    },
    cardContent: {
      padding: dimensions.cardPadding,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    iconContainer: {
      width: spacing.huge,
      height: spacing.huge,
      borderRadius: radius.lg,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.lg,
    },
    infoContent: {
      flex: 1,
    },
    button: {
      marginTop: spacing.md,
    },
    hintText: {
      marginTop: spacing.md,
      textAlign: "center",
    },
  });
