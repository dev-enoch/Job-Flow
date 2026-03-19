import { JobApplication } from "../types/jobs";
import JobService from "../services/JobService";

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
