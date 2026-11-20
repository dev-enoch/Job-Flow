import { z } from "zod";
import { jobStatusEnum } from "../constants/jobStatus";

/**
 * Canonical validation schema for a job application. Used to validate
 * untrusted input — most importantly jobs imported from a JSON backup file —
 * before anything is written to SQLite. Unknown extra keys are stripped.
 */
export const jobApplicationSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().min(1),
  salary: z.string().optional(),
  dateApplied: z.string().min(1),
  status: jobStatusEnum,
  url: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const jobBackupSchema = z.object({
  metadata: z
    .object({
      version: z.string(),
      lastUpdated: z.string().optional(),
      device: z.string().optional(),
      appVersion: z.string().optional(),
    })
    .passthrough(),
  jobs: z.array(z.unknown()),
});

export type JobBackupFile = z.infer<typeof jobBackupSchema>;
