import { Platform } from "react-native";
import Constants, { AndroidManifest, IOSManifest, WebManifest } from "expo-constants";
import * as FileSystem from "expo-file-system";
import getAccessToken from "../utils/token";
import logger from "../utils/logger";
import { JobApplication } from "../types/jobs";
import { jobBackupSchema } from "../schemas/job";

const BACKUP_FILENAME = "jobflow_backup.json";
const MIME_TYPE = "application/json";
const BACKUP_VERSION = "1.0";

export interface BackupPayload {
  metadata: {
    version: string;
    lastUpdated: string;
    device: string;
    appVersion: string;
  };
  jobs: JobApplication[];
}

type PlatformSpecificManifest = AndroidManifest | IOSManifest | WebManifest;

class BackupService {
    private getPlatformManifest(): PlatformSpecificManifest | undefined {
        const manifest = Constants.manifest;
        if (!manifest) return undefined;

        switch (Platform.OS) {
            case "ios":
                return manifest as unknown as IOSManifest;
            case "android":
                return manifest as unknown as AndroidManifest;
            case "web":
                return manifest as WebManifest;
            default:
                return manifest as PlatformSpecificManifest;
        }
    }

    buildBackupPayload(jobs: JobApplication[]): BackupPayload {
        return {
            metadata: {
                version: BACKUP_VERSION,
                lastUpdated: new Date().toISOString(),
                device: Platform.OS,
                appVersion: this.getPlatformManifest()?.version || "unknown",
            },
            jobs,
        };
    }

    // ─── Local JSON file backup (document picker / share sheet) ─────────────

    /**
     * Write the jobs to a JSON file in the app's document directory and
     * return its URI so the caller can hand it to the share sheet.
     */
    async exportJobsToFile(jobs: JobApplication[]): Promise<string> {
        const payload = this.buildBackupPayload(jobs);
        const jsonData = JSON.stringify(payload, null, 2);
        const fileUri = (FileSystem.documentDirectory || "") + BACKUP_FILENAME;
        await FileSystem.writeAsStringAsync(fileUri, jsonData, {
            encoding: FileSystem.EncodingType.UTF8,
        });
        return fileUri;
    }

    /**
     * Read and validate a JSON backup file (for example one picked with the
     * document picker). Returns the payload, or throws on invalid content.
     */
    async importJobsFromFile(fileUri: string): Promise<BackupPayload> {
        const jsonData = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8,
        });
        let parsed: unknown;
        try {
            parsed = JSON.parse(jsonData);
        } catch {
            throw new Error("Backup file is not valid JSON");
        }
        const result = jobBackupSchema.safeParse(parsed);
        if (!result.success) {
            throw new Error("Backup file has an invalid format");
        }
        // Jobs themselves are validated one by one at import time
        // (JobService.importJobs), so unknown/invalid entries are skipped
        // rather than failing the whole restore.
        return {
            metadata: {
                version: result.data.metadata.version,
                lastUpdated: result.data.metadata.lastUpdated || new Date().toISOString(),
                device: result.data.metadata.device || "unknown",
                appVersion: result.data.metadata.appVersion || "unknown",
            },
            jobs: result.data.jobs as JobApplication[],
        };
    }

    // ─── Google Drive backup (requires sign-in) ─────────────────────────────

    async createBackup(jobs: JobApplication[]): Promise<boolean> {
        try {
            const accessToken = await getAccessToken();
            if (!accessToken) throw new Error("Not authenticated");

            const backupData = this.buildBackupPayload(jobs);
            const jsonData = JSON.stringify(backupData);
            const existingFileId = await this.findBackupFile(accessToken);

            if (existingFileId) {
                await this.updateFile(accessToken, existingFileId, jsonData);
            } else {
                await this.createFile(accessToken, jsonData);
            }

            return true;
        } catch (error) {
            logger.error("Backup failed:", error);
            return false;
        }
    }

    async restoreBackup(): Promise<BackupPayload | null> {
        try {
            const accessToken = await getAccessToken();
            if (!accessToken) throw new Error("Not authenticated");

            const fileId = await this.findBackupFile(accessToken);
            if (!fileId) return null;

            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch backup");

            const backupData = await response.json();
            const result = jobBackupSchema.safeParse(backupData);
            if (!result.success) throw new Error("Invalid backup format");

            return {
                metadata: {
                    version: result.data.metadata.version,
                    lastUpdated: result.data.metadata.lastUpdated || new Date().toISOString(),
                    device: result.data.metadata.device || "unknown",
                    appVersion: result.data.metadata.appVersion || "unknown",
                },
                jobs: result.data.jobs as JobApplication[],
            };
        } catch (error) {
            logger.error("Restore failed:", error);
            return null;
        }
    }

    async getBackupInfo(): Promise<any> {
        try {
            const accessToken = await getAccessToken();
            if (!accessToken) throw new Error("Not authenticated");

            const fileId = await this.findBackupFile(accessToken);
            if (!fileId) return null;

            const metaResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?fields=modifiedTime,size`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!metaResponse.ok) throw new Error("Failed to fetch file metadata");

            const metadata = await metaResponse.json();

            const contentResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!contentResponse.ok)
                throw new Error("Failed to fetch backup content");

            const backupData = await contentResponse.json();

            return {
                lastUpdated: metadata.modifiedTime,
                size: parseInt(metadata.size || "0"),
                version: backupData.metadata?.version,
                device: backupData.metadata?.device,
                appVersion: backupData.metadata?.appVersion,
            };
        } catch (error) {
            logger.error("Failed to get backup info:", error);
            return null;
        }
    }

    private async findBackupFile(accessToken: string): Promise<string | null> {
        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}' and 'appDataFolder' in parents`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to search files");

            const data = await response.json();
            return data.files?.[0]?.id || null;
        } catch (error) {
            logger.error("File search failed:", error);
            return null;
        }
    }

    private async createFile(accessToken: string, jsonData: string): Promise<void> {
        const metadata = {
            name: BACKUP_FILENAME,
            mimeType: MIME_TYPE,
            parents: ["appDataFolder"],
        };

        const boundary = "jobflow_backup_boundary";
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const multipartRequestBody =
            delimiter +
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            "Content-Type: application/json\r\n\r\n" +
            jsonData +
            close_delim;

        const response = await fetch(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": `multipart/related; boundary=${boundary}`,
                },
                body: multipartRequestBody,
            }
        );

        if (!response.ok) throw new Error("Failed to create file");
    }

    private async updateFile(
        accessToken: string,
        fileId: string,
        jsonData: string
    ): Promise<void> {
        const metadata = {
            name: BACKUP_FILENAME,
            mimeType: MIME_TYPE,
        };

        const boundary = "jobflow_backup_boundary";
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const multipartRequestBody =
            delimiter +
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            "Content-Type: application/json\r\n\r\n" +
            jsonData +
            close_delim;

        const response = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": `multipart/related; boundary=${boundary}`,
                },
                body: multipartRequestBody,
            }
        );

        if (!response.ok) throw new Error("Failed to update file");
    }
}

export default new BackupService();
