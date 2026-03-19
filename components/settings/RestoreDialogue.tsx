import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../../context/themeContext";
import Text from "../ui/Text";
import Button from "../ui/Button";
import { useRouter } from "expo-router";
import { useBackup } from "../../utils/backup";
import { useAuth } from "../../context/authContext";
import Toast from "react-native-toast-message";
import { formatDistanceToNow } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { JobApplication } from "../../types/jobs";
import { MotiView } from "moti";
import { CloudDownload, Smartphone, HardDrive, Clock, ShieldAlert, AlertTriangle, MonitorSmartphone } from "lucide-react-native";
import logger from "../../utils/logger";

const JOBS_STORAGE_KEY = "jobtracker_jobs";
const LAST_SYNC_KEY = "jobtracker_last_sync";
const PENDING_CHANGES_KEY = "jobtracker_pending_changes";

export default function RestoreDialog() {
  const { theme } = useTheme();
  const router = useRouter();
  const { restoreBackup, getBackupInfo } = useBackup();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
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
          throw new Error("Not authenticated");
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

  const handleRestore = async () => {
    if (!user) return;

    setRestoring(true);
    try {
      const result = await restoreBackup();

      if (result && result.appData) {
        const backupJobs: JobApplication[] = result.appData.jobs || [];

        const existingJobsRaw = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
        const existingJobs: JobApplication[] = existingJobsRaw
          ? JSON.parse(existingJobsRaw)
          : [];

        const existingJobIds = new Set(existingJobs.map((job) => job.id));

        const newJobs = backupJobs.filter((job) => !existingJobIds.has(job.id));

        const mergedJobs = [...newJobs, ...existingJobs];

        await Promise.all([
          AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(mergedJobs)),
          AsyncStorage.setItem(
            LAST_SYNC_KEY,
            result.appData.lastSync || new Date().toISOString()
          ),
          AsyncStorage.setItem(
            PENDING_CHANGES_KEY,
            JSON.stringify(result.appData.pendingChanges || [])
          ),
        ]);

        Toast.show({
          type: "success",
          text1: "Restore Successful",
          text2: `Restored backup from ${formatDate(
            result.metadata.lastUpdated
          )}`,
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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
          {icon}
        </View>
        <View style={{ flex: 1 }}>
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
      {loading ? (
        <View style={{ alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 16, color: theme.text.secondary }}>
            Checking for backup on Google Drive...
          </Text>
        </View>
      ) : !user ? (
        <View style={{ alignItems: 'center', width: '100%', padding: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <CloudDownload size={40} color={theme.primary} />
          </View>
          <Text
            variant="h2"
            weight="bold"
            align="center"
            style={{ color: theme.text.primary, marginBottom: 12 }}
          >
            Sign In Required
          </Text>
          <Text
            style={{
              color: theme.text.secondary,
              marginBottom: 32,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            You need to be signed securely into your Google Account to fetch and restore your private cloud backups.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            style={{ width: '100%' }}
          />
        </View>
      ) : !backupInfo ? (
        <View style={{ alignItems: 'center', width: '100%', padding: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <HardDrive size={36} color={theme.text.disabled} />
          </View>
          <Text
            variant="h2"
            weight="bold"
            align="center"
            style={{ color: theme.text.primary, marginBottom: 12 }}
          >
            No Backup Found
          </Text>
          <Text
            style={{
              color: theme.text.secondary,
              marginBottom: 32,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            We searched your Google Drive but couldn't locate any existing JobFlow snapshot. Have you backed up your data yet?
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            style={{ width: '100%' }}
          />
        </View>
      ) : (
        <View style={{ width: '100%' }}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <CloudDownload size={32} color={theme.primary} />
            </View>
            <Text variant="h2" weight="bold" align="center" style={{ color: theme.text.primary, marginBottom: 8 }}>
              Restore Backup
            </Text>
            <Text color="secondary" align="center" style={{ marginBottom: 24 }}>
              A valid snapshot was found safely on your Google Drive.
            </Text>
          </View>

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

          <View style={[styles.warningBox, { backgroundColor: theme.error + "20", borderColor: theme.error + "50" }]}>
            <AlertTriangle size={24} color={theme.error} style={{ marginBottom: 8 }} />
            <Text style={[styles.warningText, { color: theme.error }]}>
              DANGER ZONE
            </Text>
            <Text style={{ textAlign: 'center', color: theme.error, fontSize: 13, lineHeight: 20 }}>
              Initiating restore will permanently overwrite and replace all local jobs currently on this device with the cloud snapshot.
            </Text>
          </View>

          <Button
            title={restoring ? "Restoring data..." : "Confirm & Restore"}
            onPress={handleRestore}
            disabled={restoring}
            variant="primary"
            leftIcon={restoring ? undefined : <CloudDownload size={18} color={theme.background} />}
            style={{ marginBottom: 12 }}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 82, 255, 0.1)',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  backupInfo: {
    width: "100%",
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  warningBox: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  warningText: {
    fontWeight: "bold",
    marginBottom: 4,
  },
});
