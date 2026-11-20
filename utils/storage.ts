import { JobApplication } from "../types/jobs";
import JobService, { PendingChange } from "../services/JobService";

export function createJob(jobData: Omit<JobApplication, "id">): JobApplication {
  return JobService.createJobData(jobData);
}

export async function getJobs(): Promise<JobApplication[]> {
  return await JobService.getJobs();
}

export async function addJob(job: JobApplication): Promise<void> {
  return await JobService.addJob(job);
}

export async function updateJob(job: JobApplication): Promise<void> {
  return await JobService.updateJob(job);
}

export async function deleteJob(jobId: string): Promise<void> {
  return await JobService.deleteJob(jobId);
}

export async function clearAllJobs(): Promise<void> {
  return await JobService.clearAllJobs();
}

export async function importJobs(
  jobs: unknown[]
): Promise<{ imported: number; skipped: number }> {
  return await JobService.importJobs(jobs);
}

export async function getPendingChanges(): Promise<PendingChange[]> {
  return await JobService.getPendingChanges();
}

export async function clearPendingChanges(): Promise<void> {
  return await JobService.clearPendingChanges();
}

/**
 * Replay the offline pending-change queue through a caller-supplied sync
 * handler. Returns how many changes were replayed and how many remain
 * queued. There is no sync backend yet, so callers supply the handler that
 * talks to theirs.
 */
export async function replayPendingChanges(
  replay: (change: PendingChange) => Promise<boolean>
): Promise<{ replayed: number; remaining: number }> {
  return await JobService.replayPendingChanges(replay);
}
