import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useTheme } from "../../context/themeContext";
import Text from "../ui/Text";
import Button from "../ui/Button";
import { useRouter } from "expo-router";
import { useBackup } from "../../utils/backup";
import { useAuth } from "../../context/authContext";
import { useJobs } from "../../context/jobContext";
import { importJobs } from "../../utils/storage";
import Toast from "react-native-toast-message";
import { formatDistanceToNow } from "date-fns";
import { MotiView } from "moti";
import { CloudDownload, Smartphone, HardDrive, Clock, AlertTriangle, MonitorSmartphone, FileJson, FolderOpen } from "lucide-react-native";
import logger from "../../utils/logger";
import { ThemeColors } from "../../constants/colors";
import {
  dimensions,
  radius,
  spacing,
} from "../../constants/design-tokens";

export default function RestoreDialog() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { restoreBackup, getBackupInfo, importLocalBackup } = useBackup();
  const { user } = useAuth();
  const { refreshJobs } = useJobs();

  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [importingFile, setImportingFile] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{
    lastUpdated?: string;
    size?: number;
    device?: string;
    appVersion?: string;
  } | null>(null);

  useEffect(() => {
    const fetchBackupInfo = async () => {
      setLoading(true);
      try {
        if (!user) {
          setBackupInfo(null);
          return;
        }

        const info = await getBackupInfo();
        setBackupInfo(info);
      } catch (error) {
        logger.error("Failed to fetch backup info:", error);
        Toast.show({
          type: "error",
          text1: "Backup Error",
          text2: "Failed to check for backups",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBackupInfo();
  }, [user]);

  const handleRestoreFromFile = async () => {
    setImportingFile(true);
    try {
      const counts = await importLocalBackup();
      if (!counts) {
        // User cancelled the document picker — nothing to do.
        return;
      }
      await refreshJobs();
      Toast.show({
        type: "success",
        text1: "Restore Successful",
        text2:
          `Imported ${counts.imported} application${counts.imported === 1 ? "" : "s"}` +
          (counts.skipped > 0 ? `, skipped ${counts.skipped} invalid ${counts.skipped === 1 ? "entry" : "entries"}.` : "."),
      });
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      logger.error("Restore from file failed:", error);
      Toast.show({
        type: "error",
        text1: "Restore Failed",
        text2: (error as Error).message || "Could not restore from the selected file.",
      });
    } finally {
      setImportingFile(false);
    }
  };

  const handleRestore = async () => {
    if (!user) return;

    setRestoring(true);
    try {
      const result = await restoreBackup();

      if (result && result.jobs) {
        // Merge into SQLite: existing ids are updated, new ids are added,
        // invalid entries are skipped.
        const counts = await importJobs(result.jobs);
        await refreshJobs();

        Toast.show({
          type: "success",
          text1: "Restore Successful",
          text2:
            `Restored backup from ${formatDate(result.metadata.lastUpdated)} — ` +
            `${counts.imported} application${counts.imported === 1 ? "" : "s"} imported` +
            (counts.skipped > 0 ? `, ${counts.skipped} skipped.` : "."),
        });

        setTimeout(() => router.back(), 1500);
      } else {
        throw new Error("No valid backup data found");
      }
    } catch (error) {
      logger.error("Restore failed:", error);
      Toast.show({
        type: "error",
        text1: "Restore Failed",
        text2: "Could not restore from backup",
      });
    } finally {
      setRestoring(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Unknown date";
    return formatDistanceToNow(new Date(isoString), { addSuffix: true });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => {
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoIconContainer}>
          {icon}
        </View>
        <View style={styles.infoContent}>
          <Text variant="caption" color="secondary">{label}</Text>
          <Text variant="body" weight="bold">{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <MotiView
      style={[styles.container, { backgroundColor: theme.background }]}
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 17 }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Restore from a JSON file (no sign-in needed) ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileJson size={24} color={theme.primary} />
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Restore from a JSON file
            </Text>
          </View>
          <View style={styles.sectionBody}>
            <Text variant="bodySmall" color="secondary" style={styles.introText}>
              Pick a jobflow_backup.json file you exported earlier. Its applications
              are merged into this device — existing ones are updated, new ones are
              added, and invalid entries are skipped.
            </Text>
            <Button
              title={importingFile ? "Importing..." : "Choose Backup File"}
              leftIcon={importingFile ? undefined : <FolderOpen size={18} color={theme.background} />}
              onPress={handleRestoreFromFile}
              isLoading={importingFile}
            />
          </View>
        </View>

        {/* ─── Restore from Google Drive (requires sign-in) ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CloudDownload size={24} color={theme.primary} />
            <Text variant="h3" weight="bold" style={styles.sectionTitle}>
              Restore from Google Drive
            </Text>
          </View>
          <View style={styles.sectionBody}>
            {loading ? (
              <View style={styles.centeredBlock}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text variant="body" color="secondary" style={styles.loadingText}>
                  Checking for backup on Google Drive...
                </Text>
              </View>
            ) : !user ? (
              <View style={styles.centeredBlockSmall}>
                <Text
                  variant="bodySmall"
                  color="secondary"
                  align="center"
                  style={styles.centeredText}
                >
                  Sign in with Google to fetch and restore your cloud backups.
                </Text>
                <Button
                  variant="outline"
                  title="Sign In Required"
                  disabled={true}
                />
              </View>
            ) : !backupInfo ? (
              <View style={styles.centeredBlockSmall}>
                <View style={styles.emptyIconCircle}>
                  <HardDrive size={36} color={theme.text.disabled} />
                </View>
                <Text
                  variant="h2"
                  weight="bold"
                  align="center"
                  style={styles.emptyTitle}
                >
                  No Backup Found
                </Text>
                <Text
                  variant="bodySmall"
                  color="secondary"
                  align="center"
                  style={styles.centeredText}
                >
                  We searched your Google Drive but couldn&apos;t locate any existing JobFlow snapshot. Have you backed up your data yet?
                </Text>
              </View>
            ) : (
              <View>
                <View style={[styles.backupInfo, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                  <InfoRow
                    icon={<Clock size={20} color={theme.primary} />}
                    label="Snapshot Timestamp"
                    value={formatDate(backupInfo.lastUpdated)}
                  />
                  <InfoRow
                    icon={<HardDrive size={20} color={theme.primary} />}
                    label="Archive Size"
                    value={formatFileSize(backupInfo.size)}
                  />
                  <InfoRow
                    icon={<Smartphone size={20} color={theme.primary} />}
                    label="Backed up from"
                    value={backupInfo.device || "Unknown device"}
                  />
                  <InfoRow
                    icon={<MonitorSmartphone size={20} color={theme.primary} />}
                    label="App Version"
                    value={backupInfo.appVersion || "Unknown version"}
                  />
                </View>

                <View style={[styles.warningBox, { backgroundColor: theme.warning + "20", borderColor: theme.warning + "50" }]}>
                  <AlertTriangle size={24} color={theme.warning} style={styles.warningIcon} />
                  <Text weight="bold" style={[styles.warningText, { color: theme.warning }]}>
                    Restoring merges, it does not wipe
                  </Text>
                  <Text variant="bodySmall" color="secondary" align="center">
                    Applications from the backup are merged with the ones on this device. If an application already exists here, the backup version replaces it.
                  </Text>
                </View>

                <Button
                  title={restoring ? "Restoring data..." : "Confirm & Restore"}
                  onPress={handleRestore}
                  disabled={restoring}
                  variant="primary"
                  leftIcon={restoring ? undefined : <CloudDownload size={18} color={theme.background} />}
                  style={styles.confirmButton}
                />
              </View>
            )}
          </View>
        </View>

        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
        />
      </ScrollView>
    </MotiView>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    padding: dimensions.screenPadding,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
    marginBottom: dimensions.sectionGap,
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
  sectionBody: {
    padding: dimensions.cardPadding,
  },
  introText: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  infoIconContainer: {
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
  centeredBlock: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  centeredBlockSmall: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  centeredText: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.lg,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: dimensions.sectionGap,
  },
  emptyTitle: {
    color: theme.text.primary,
    marginBottom: spacing.md,
  },
  backupInfo: {
    width: "100%",
    marginBottom: dimensions.sectionGap,
    padding: dimensions.cardPadding,
    borderRadius: radius.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  warningBox: {
    width: "100%",
    padding: dimensions.cardPadding,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: dimensions.sectionGap,
  },
  warningIcon: {
    marginBottom: spacing.sm,
  },
  warningText: {
    marginBottom: spacing.xs,
  },
  confirmButton: {
    marginBottom: spacing.md,
  },
});
