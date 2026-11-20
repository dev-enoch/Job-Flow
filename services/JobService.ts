import AsyncStorage from "@react-native-async-storage/async-storage";
import { JobApplication } from "../types/jobs";
import uuid from "react-native-uuid";
import { JobStatus } from "../constants/jobStatus";
import * as SQLite from 'expo-sqlite';
import logger from "../utils/logger";
import { jobApplicationSchema } from "../schemas/job";

const JOBS_STORAGE_KEY = "jobtracker_jobs"; // For migration
const LAST_SYNC_KEY = "jobtracker_last_sync";
const PENDING_CHANGES_KEY = "jobtracker_pending_changes";

export interface PendingChange {
    id?: number;
    type: "create" | "update" | "delete";
    job: JobApplication;
    timestamp: number;
}

class JobService {
    private db: SQLite.SQLiteDatabase;
    private isInitialized: boolean = false;
    // Resolves once the first-launch AsyncStorage migration has finished.
    // Public methods await it so a read can never race the migration and
    // return an empty list while old jobs are still being copied over.
    private ready: Promise<void>;

    constructor() {
        // Open synchronously, this uses expo-sqlite SDK 51+ patterns
        this.db = SQLite.openDatabaseSync("jobflow.db");
        this.initDB();
        this.ready = this.migrateFromAsyncStorage();
    }

    private initDB() {
        try {
            this.db.execSync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS jobs (
          id TEXT PRIMARY KEY NOT NULL,
          company TEXT NOT NULL,
          role TEXT NOT NULL,
          location TEXT NOT NULL,
          salary TEXT,
          dateApplied TEXT NOT NULL,
          status TEXT NOT NULL,
          url TEXT,
          notes TEXT,
          followUpDate TEXT,
          contactPerson TEXT,
          contactEmail TEXT,
          tags TEXT
        );
        
        CREATE TABLE IF NOT EXISTS pending_changes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          jobId TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          jobData TEXT NOT NULL
        );
      `);
            this.isInitialized = true;
        } catch (e) {
            logger.error("Failed to init SQLite", e);
        }
    }

    private async migrateFromAsyncStorage() {
        try {
            const data = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
            if (!data) return;
            const oldJobs: JobApplication[] = JSON.parse(data);
            if (oldJobs.length === 0) return;
            // Only migrate into an empty SQLite store, and query the table
            // directly here (not via getLocalJobs) to avoid awaiting our own
            // migration promise.
            const existing = await this.db.getAllAsync<{ id: string }>(
                `SELECT id FROM jobs LIMIT 1`
            );
            if (existing.length === 0) {
                logger.log("Migrating", oldJobs.length, "jobs from AsyncStorage to SQLite");
                for (const job of oldJobs) {
                    await this.privateAddJob(job);
                }
                // Clear async storage once migration is verified
                await AsyncStorage.removeItem(JOBS_STORAGE_KEY);
            }
        } catch (e) {
            logger.error("Error migrating from AsyncStorage", e);
        }
    }

    // --- SQLite Internal Methods ---

    private async privateAddJob(job: JobApplication): Promise<void> {
        const query = `
      INSERT OR REPLACE INTO jobs 
      (id, company, role, location, salary, dateApplied, status, url, notes, followUpDate, contactPerson, contactEmail, tags) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const params = [
            job.id, job.company, job.role, job.location,
            job.salary || null, job.dateApplied, job.status, job.url || null,
            job.notes || null, job.followUpDate || null, job.contactPerson || null, job.contactEmail || null,
            job.tags ? JSON.stringify(job.tags) : null
        ];

        await this.db.runAsync(query, params);
    }

    async getLocalJobs(): Promise<JobApplication[]> {
        await this.ready;
        try {
            const rows = await this.db.getAllAsync<{
                id: string; company: string; role: string; location: string;
                salary: string | null; dateApplied: string; status: string; url: string | null;
                notes: string | null; followUpDate: string | null;
                contactPerson: string | null; contactEmail: string | null; tags: string | null;
            }>(`SELECT * FROM jobs ORDER BY dateApplied DESC`);

            return rows.map(row => ({
                id: row.id,
                company: row.company,
                role: row.role,
                location: row.location,
                salary: row.salary || undefined,
                dateApplied: row.dateApplied,
                status: row.status as JobStatus,
                url: row.url || undefined,
                notes: row.notes || undefined,
                followUpDate: row.followUpDate || undefined,
                contactPerson: row.contactPerson || undefined,
                contactEmail: row.contactEmail || undefined,
                tags: row.tags ? JSON.parse(row.tags) : undefined
            }));
        } catch (error) {
            logger.error("Error reading local sqlite jobs:", error);
            return [];
        }
    }

    async getPendingChanges(): Promise<PendingChange[]> {
        await this.ready;
        try {
            const rows = await this.db.getAllAsync<{
                id: number; type: string; jobId: string; timestamp: number; jobData: string;
            }>(`SELECT * FROM pending_changes ORDER BY timestamp ASC`);

            return rows.map(row => ({
                id: row.id,
                type: row.type as "create" | "update" | "delete",
                timestamp: row.timestamp,
                job: JSON.parse(row.jobData)
            }));
        } catch (error) {
            logger.error("Error reading pending changes:", error);
            return [];
        }
    }

    /**
     * Replay the offline pending-change queue through a caller-supplied sync
     * handler (for example a future backend sync). Each change the handler
     * reports as synced is removed from the queue; failures stay queued for
     * the next attempt. Returns how many were replayed and how many remain.
     */
    async replayPendingChanges(
        replay: (change: PendingChange) => Promise<boolean>
    ): Promise<{ replayed: number; remaining: number }> {
        await this.ready;
        const pending = await this.getPendingChanges();
        let replayed = 0;
        for (const change of pending) {
            try {
                const ok = await replay(change);
                if (ok && change.id !== undefined) {
                    await this.db.runAsync(
                        `DELETE FROM pending_changes WHERE id = ?`,
                        [change.id]
                    );
                    replayed++;
                }
            } catch (error) {
                logger.error("Failed to replay pending change:", error);
            }
        }
        const remaining = (await this.getPendingChanges()).length;
        return { replayed, remaining };
    }

    async clearPendingChanges(): Promise<void> {
        await this.ready;
        await this.db.runAsync(`DELETE FROM pending_changes`);
    }

    /**
     * Import jobs from an untrusted source (for example a JSON backup file).
     * Each entry is validated against the job schema; invalid entries are
     * skipped and counted. Valid jobs are upserted by id and queued as
     * pending changes so a later sync can replay them.
     */
    async importJobs(
        jobs: unknown[]
    ): Promise<{ imported: number; skipped: number }> {
        await this.ready;
        let imported = 0;
        let skipped = 0;
        for (const raw of jobs) {
            try {
                const job = jobApplicationSchema.parse(raw);
                await this.privateAddJob(job);
                await this.addPendingChange("update", job);
                imported++;
            } catch (error) {
                logger.error("Skipping invalid job in import:", error);
                skipped++;
            }
        }
        return { imported, skipped };
    }

    async addPendingChange(type: "create" | "update" | "delete", job: JobApplication): Promise<void> {
        try {
            await this.db.runAsync(
                `INSERT INTO pending_changes (type, jobId, timestamp, jobData) VALUES (?, ?, ?, ?)`,
                [type, job.id, Date.now(), JSON.stringify(job)]
            );
        } catch (error) {
            logger.error("Error saving pending changes:", error);
        }
    }

    // --- Public Action API ---

    createJobData(jobData: Omit<JobApplication, "id">): JobApplication {
        return {
            id: uuid.v4().toString(),
            ...jobData,
        };
    }

    async getJobs(): Promise<JobApplication[]> {
        return await this.getLocalJobs();
    }

    async addJob(job: JobApplication): Promise<void> {
        await this.ready;
        try {
            await this.privateAddJob(job);
            await this.addPendingChange("create", job);
        } catch (error) {
            logger.error("Error adding sqlite job:", error);
            throw error;
        }
    }

    async updateJob(job: JobApplication): Promise<void> {
        await this.ready;
        try {
            // Since privateAddJob uses INSERT OR REPLACE, it behaves correctly for updates on the PK
            await this.privateAddJob(job);
            await this.addPendingChange("update", job);
        } catch (error) {
            logger.error("Error updating sqlite job:", error);
            throw error;
        }
    }

    async deleteJob(jobId: string): Promise<void> {
        await this.ready;
        try {
            // Fetch before deleting to store in pending changes
            const jobRows = await this.db.getAllAsync<{
                id: string; company: string; role: string; location: string;
                salary: string | null; dateApplied: string; status: string; url: string | null;
                notes: string | null; followUpDate: string | null;
                contactPerson: string | null; contactEmail: string | null; tags: string | null;
            }>(`SELECT * FROM jobs WHERE id = ?`, [jobId]);

            const isJobDeleted = await this.db.runAsync(`DELETE FROM jobs WHERE id = ?`, [jobId]);

            if (isJobDeleted.changes > 0) {
                // If a job was found and deleted, add a pending change
                if (jobRows.length > 0) {
                    const deletedJobRow = jobRows[0];
                    const deletedJob: JobApplication = {
                        id: deletedJobRow.id,
                        company: deletedJobRow.company,
                        role: deletedJobRow.role,
                        location: deletedJobRow.location,
                        salary: deletedJobRow.salary || undefined,
                        dateApplied: deletedJobRow.dateApplied,
                        status: deletedJobRow.status as JobStatus,
                        url: deletedJobRow.url || undefined,
                        notes: deletedJobRow.notes || undefined,
                        followUpDate: deletedJobRow.followUpDate || undefined,
                        contactPerson: deletedJobRow.contactPerson || undefined,
                        contactEmail: deletedJobRow.contactEmail || undefined,
                        tags: deletedJobRow.tags ? JSON.parse(deletedJobRow.tags) : undefined
                    };
                    await this.addPendingChange("delete", deletedJob);
                } else {
                    // Fallback if jobRows was empty for some reason, create a minimal job object
                    await this.addPendingChange("delete", { id: jobId, company: '', role: '', location: '', dateApplied: '', status: 'applied' } as unknown as JobApplication);
                }
            }
        } catch (error) {
            logger.error("Error deleting job:", error);
            throw error;
        }
    }

    async clearAllJobs(): Promise<void> {
        await this.ready;
        try {
            await this.db.runAsync(`DELETE FROM jobs`);
            await this.db.runAsync(`DELETE FROM pending_changes`);
            await AsyncStorage.removeItem(LAST_SYNC_KEY);
        } catch (error) {
            logger.error("Error clearing all jobs:", error);
            throw error;
        }
    }

    // Job Utils
    getStatusCounts(jobs: JobApplication[]) {
        const counts: Record<JobStatus, number> = {
            applied: 0,
            interviewing: 0,
            offered: 0,
            rejected: 0,
            accepted: 0,
            declined: 0,
        };

        jobs.forEach((job) => {
            counts[job.status]++;
        });

        return counts;
    }

    filterJobsByStatus(jobs: JobApplication[], status: JobStatus | "all") {
        if (status === "all") {
            return jobs;
        }
        return jobs.filter((job) => job.status === status);
    }

    searchJobs(jobs: JobApplication[], query: string) {
        if (!query.trim()) {
            return jobs;
        }

        const lowercaseQuery = query.toLowerCase();
        return jobs.filter((job) => {
            return (
                job.company.toLowerCase().includes(lowercaseQuery) ||
                job.role.toLowerCase().includes(lowercaseQuery) ||
                job.location.toLowerCase().includes(lowercaseQuery) ||
                (job.notes && job.notes.toLowerCase().includes(lowercaseQuery)) ||
                (job.contactPerson &&
                    job.contactPerson.toLowerCase().includes(lowercaseQuery)) ||
                (job.tags &&
                    job.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)))
            );
        });
    }
}

export default new JobService();
