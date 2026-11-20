import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import BackupService, { BackupPayload } from "../services/BackupService";
import { getJobs, importJobs } from "./storage";

const LAST_BACKUP_DATE_KEY = "lastBackupDate";

export const useBackup = () => {
  /**
   * Local JSON backup: export every job from SQLite to jobflow_backup.json
   * and open the system share sheet so the file can be saved, sent or
   * stored anywhere. Works offline and needs no sign-in.
   */
  const exportLocalBackup = async (): Promise<{
    uri: string;
    jobCount: number;
    size: number | null;
  }> => {
    const jobs = await getJobs();
    const fileUri = await BackupService.exportJobsToFile(jobs);

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    const size = fileInfo.exists && fileInfo.size ? fileInfo.size : null;

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error("Sharing is not available on this device");
    }
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/json",
      dialogTitle: "Save your JobFlow backup",
    });

    const now = new Date();
    await AsyncStorage.setItem(LAST_BACKUP_DATE_KEY, now.toISOString());
    return { uri: fileUri, jobCount: jobs.length, size };
  };

  /**
   * Local JSON restore: pick a backup file with the document picker,
   * validate it and merge its jobs into SQLite (existing ids are updated,
   * new ids are added, invalid entries are skipped). Returns null when the
   * user cancels the picker.
   */
  const importLocalBackup = async (): Promise<{
    imported: number;
    skipped: number;
  } | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });
    if (result.canceled) {
      return null;
    }
    const fileUri = result.assets[0]?.uri;
    if (!fileUri) {
      throw new Error("No file was selected");
    }
    const payload = await BackupService.importJobsFromFile(fileUri);
    const counts = await importJobs(payload.jobs);
    return counts;
  };

  const getLastLocalBackupDate = async (): Promise<Date | null> => {
    const raw = await AsyncStorage.getItem(LAST_BACKUP_DATE_KEY);
    return raw ? new Date(raw) : null;
  };

  /** Google Drive backup (requires sign-in). Jobs come from SQLite. */
  const createBackup = async (): Promise<boolean> => {
    const jobs = await getJobs();
    return await BackupService.createBackup(jobs);
  };

  /** Google Drive restore (requires sign-in). Returns the backup payload. */
  const restoreBackup = async (): Promise<BackupPayload | null> => {
    return await BackupService.restoreBackup();
  };

  const getBackupInfo = async () => {
    return await BackupService.getBackupInfo();
  };

  return {
    exportLocalBackup,
    importLocalBackup,
    getLastLocalBackupDate,
    createBackup,
    restoreBackup,
    getBackupInfo,
  };
};
