import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { JobApplication } from "../types/jobs";
import { addJob, deleteJob, getJobs, updateJob } from "../utils/storage";
import { showToast } from "../utils/toast";
import logger from "../utils/logger";

type JobsContextType = {
  jobs: JobApplication[];
  addJobFromContext: (job: JobApplication) => Promise<void>;
  refreshJobs: () => Promise<void>;
  handleUpdateJob: (job: JobApplication) => Promise<void>;
  handleDeleteJob: (id: string) => Promise<void>;
};

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const JobsProvider = ({ children }: { children: React.ReactNode }) => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);

  const refreshJobs = async () => {
    try {
      const stored = await getJobs();
      setJobs(stored || []);
    } catch (error) {
      logger.error("Error fetching jobs:", error);
      showToast.error("Failed to load jobs", "Please try again later.");
    }
  };

  useEffect(() => {
    refreshJobs();
  }, []);

  const addJobFromContext = async (job: JobApplication) => {
    try {
      await addJob(job);
      await refreshJobs();
      showToast.job(
        "Application Added 🎉",
        `${job.role} at ${job.company} has been saved.`
      );
    } catch (error) {
      logger.error("Error adding job:", error);
      showToast.error("Add Job Failed", "Could not add the job application.");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const jobToDelete = jobs.find((j) => j.id === id);
      await deleteJob(id);
      await refreshJobs();
      showToast.success(
        "Application Removed",
        jobToDelete
          ? `${jobToDelete.role} at ${jobToDelete.company} was deleted.`
          : "The job has been deleted."
      );
    } catch (error) {
      logger.error("Error deleting job:", error);
      showToast.error("Delete Failed", "Could not delete the job application.");
    }
  };

  const handleUpdateJob = async (job: JobApplication) => {
    try {
      await updateJob(job);
      await refreshJobs();
      showToast.success(
        "Application Updated ✓",
        `${job.role} at ${job.company} has been updated.`
      );
    } catch (error) {
      logger.error("Error updating job:", error);
      showToast.error("Update Failed", "Could not update the job application.");
    }
  };

  const value = useMemo(
    () => ({
      jobs,
      addJobFromContext,
      refreshJobs,
      handleUpdateJob,
      handleDeleteJob,
    }),
    [jobs]
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return context;
};
