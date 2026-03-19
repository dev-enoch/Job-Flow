import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useTheme } from "../../context/themeContext";
import Text from "../../components/ui/Text";
import Button from "../../components/ui/Button";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import * as FileSystem from "expo-file-system";
import { ThemeColors } from "../../constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CloudUpload, Smartphone, HardDrive, Clock, Cloud, Database, ShieldCheck } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/authContext";
import { useBackup } from "../../utils/backup";
import { MotiView } from "moti";
import logger from "../../utils/logger";

export default function BackupDialog() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const { createBackup, getBackupInfo } = useBackup();

  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  const [backupSize, setBackupSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [driveBackupInfo, setDriveBackupInfo] = useState<any>(null);
  const [uploadingToDrive, setUploadingToDrive] = useState(false);

  useEffect(() => {
    const prepareBackup = async () => {
      setLoading(true);
      try {
        const keys = await AsyncStorage.getAllKeys();
        const entries = await AsyncStorage.multiGet(keys);

        const backupData = entries.reduce<Record<string, string>>(
          (acc, [key, value]) => {
            if (value !== null) {
              acc[key] = value;
            }
            return acc;
          },
          {}
        );

        const json = JSON.stringify(backupData, null, 2);
        const fileUri = FileSystem.documentDirectory + "jobflow_backup.json";

        await FileSystem.writeAsStringAsync(fileUri, json, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        const fileSize =
          fileInfo.exists && fileInfo.size ? fileInfo.size : null;

        setBackupSize(fileSize);

        const lastdate = await AsyncStorage.getItem("lastBackupDate");
        setLastBackupDate(lastdate ? new Date(lastdate) : null);

        if (user) {
          const driveInfo = await getBackupInfo();
          setDriveBackupInfo(driveInfo);
        }
      } catch (error) {
        logger.error("Error preparing backup:", error);
        setBackupSize(null);
        setLastBackupDate(null);

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
      setLoading(true);
      const currentDate = new Date();
      await AsyncStorage.setItem("lastBackupDate", currentDate.toISOString());
      setLastBackupDate(currentDate);

      Toast.show({
        type: "success",
        text1: "Backup Successful",
        text2: "Local backup created successfully.",
      });
    } catch (error) {
      logger.error("Error creating local backup:", error);
      Toast.show({
        type: "error",
        text1: "Backup Error",
        text2: "Failed to create local backup.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDriveBackup = async () => {
    if (!user) return;

    try {
      setUploadingToDrive(true);
      const keys = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(keys);

      const backupData = entries.reduce<Record<string, string>>(
        (acc, [key, value]) => {
          if (value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      const success = await createBackup(backupData);

      if (success) {
        const driveInfo = await getBackupInfo();
        setDriveBackupInfo(driveInfo);

        const currentDate = new Date();
        await AsyncStorage.setItem("lastBackupDate", currentDate.toISOString());
        setLastBackupDate(currentDate);

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
      transition={{ type: "timing", duration: 500 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <ShieldCheck size={32} color={theme.primary} />
          </View>
          <Text variant="h2" weight="bold" style={styles.title}>
            Backup Options
          </Text>
          <Text style={styles.paragraph} align="center">
            Safely store your job application data locally or in your Google Drive
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
                  Local Backup
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
                  label="Backup Size"
                  value={formatFileSize(backupSize)}
                />
                <Button
                  title="Create Local Snapshot"
                  leftIcon={<Database size={18} color={theme.background} />}
                  onPress={handleLocalBackup}
                  style={styles.button}
                />
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
      padding: 24,
      paddingTop: 32,
    },
    headerIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      marginBottom: 8,
      color: theme.text.primary,
    },
    paragraph: {
      color: theme.text.secondary,
      lineHeight: 22,
      maxWidth: "90%",
    },
    loadingBox: {
      padding: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    section: {
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: theme.card,
      borderRadius: 16,
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
      padding: 20,
      backgroundColor: theme.primaryLight + "30",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionTitle: {
      marginLeft: 12,
    },
    cardContent: {
      padding: 20,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    infoContent: {
      flex: 1,
    },
    button: {
      marginTop: 12,
    },
  });
