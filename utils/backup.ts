import BackupService from "../services/BackupService";

export const useBackup = () => {
  const createBackup = async (appData: any) => {
    return await BackupService.createBackup(appData);
  };

  const restoreBackup = async () => {
    return await BackupService.restoreBackup();
  };

  const getBackupInfo = async () => {
    return await BackupService.getBackupInfo();
  };

  return { createBackup, restoreBackup, getBackupInfo };
};
