import { Platform } from "react-native";
import Constants, { AndroidManifest, IOSManifest, WebManifest } from "expo-constants";
import getAccessToken from "../utils/token";
import logger from "../utils/logger";

const BACKUP_FILENAME = "jobflow_backup.json";
const MIME_TYPE = "application/json";

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

    async createBackup(appData: any): Promise<boolean> {
        try {
            const accessToken = await getAccessToken();
            if (!accessToken) throw new Error("Not authenticated");

            const backupData = {
                metadata: {
                    version: "1.0",
                    lastUpdated: new Date().toISOString(),
                    device: Platform.OS,
                    appVersion: this.getPlatformManifest()?.version || "unknown",
                },
                appData: appData,
            };

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

    async restoreBackup(): Promise<{ metadata: any; appData: any } | null> {
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
            this.validateBackup(backupData);

            return {
                metadata: backupData.metadata,
                appData: backupData.appData,
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

    private validateBackup(backupData: any): void {
        if (!backupData?.metadata?.version) {
            throw new Error("Invalid backup format");
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
