import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";
import { useRouter, RelativePathString } from "expo-router";
import { JobApplication } from "../types/jobs";
import { JobStatus } from "../constants/jobStatus";
import { JOBS_STORAGE_KEY } from "../utils/constants";
import logger from "../utils/logger";

// ─── Notification Handler (foreground) ────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type NotificationContextType = {
  lastOpened: number | null;
};

const NotificationContext = createContext<NotificationContextType>({
  lastOpened: null,
});

// ─── Encouragement messages pool ─────────────────────────────────────────────
const ENCOURAGEMENTS = [
  {
    title: "💪 Keep going!",
    body: "Every application brings you closer to your dream job. Don't stop now!",
  },
  {
    title: "🚀 You've got this!",
    body: "Great things take time. Your next big opportunity could be just one application away.",
  },
  {
    title: "🌟 Stay consistent!",
    body: "Job hunting is a numbers game — keep adding those applications!",
  },
  {
    title: "🎯 Focus mode ON",
    body: "Drop in to JobFlow and track where you stand today. Progress = confidence!",
  },
  {
    title: "🔥 On a roll!",
    body: "Persistence is your superpower. Open the app and see how far you've come.",
  },
  {
    title: "🏆 Success is close!",
    body: "The right job is looking for you too. Keep your tracker up to date!",
  },
  {
    title: "📋 Quick check-in",
    body: "Have any updates on your applications? Tap to log them before you forget!",
  },
  {
    title: "✨ You deserve it!",
    body: "The effort you're putting in will pay off. Check your progress in JobFlow.",
  },
  {
    title: "🌈 New day, new chances",
    body: "Today could be the day you hear back. Stay on top of your applications!",
  },
  {
    title: "💼 Career update?",
    body: "Take 2 minutes to review and update your job applications. Future you will appreciate it.",
  },
];

// ─── Provider ─────────────────────────────────────────────────────────────────
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [lastOpened, setLastOpened] = useState<number | null>(null);
  const appState = useRef(AppState.currentState);

  // Route tap-responses to the right job modal
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const jobId = response.notification.request.content.data?.jobId as
          | string
          | undefined;
        if (jobId) {
          router.push(`/(modals)/job/${jobId}` as RelativePathString);
        }
      }
    );
    return () => Notifications.removeNotificationSubscription(sub);
  }, [router]);

  // On mount: request permissions, schedule reminders + encouragements
  useEffect(() => {
    (async () => {
      const granted = await registerPermissions();
      if (!granted) return;

      await scheduleAllJobReminders();
      await scheduleEncouragementNotifications();
      await scheduleInactivityReminder();

      const now = Date.now();
      setLastOpened(now);
      await AsyncStorage.setItem("lastOpened", now.toString());
    })();

    const sub = AppState.addEventListener("change", async (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        const now = Date.now();
        setLastOpened(now);
        await AsyncStorage.setItem("lastOpened", now.toString());
        await scheduleInactivityReminder();
        await scheduleEncouragementNotifications();
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  return (
    <NotificationContext.Provider value={{ lastOpened }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);

// ─── Permission Registration ─────────────────────────────────────────────────
async function registerPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    logger.warn("Notifications only work on physical devices.");
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    logger.warn("Notification permissions not granted.");
    return false;
  }

  // Android-specific channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("jobflow-default", {
      name: "JobFlow Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3b82f6",
    });
  }

  return true;
}

// ─── Job Follow-up Reminders ─────────────────────────────────────────────────
async function scheduleAllJobReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const raw = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
  if (!raw) return;

  let jobs: JobApplication[];
  try {
    jobs = JSON.parse(raw);
  } catch {
    return;
  }

  const validStatuses: JobStatus[] = ["applied", "interviewing", "offered", "accepted"];
  const now = new Date();
  const msDay = 24 * 60 * 60 * 1000;

  for (const job of jobs) {
    if (!validStatuses.includes(job.status)) continue;

    const appliedDate = new Date(job.dateApplied);
    const follow = job.followUpDate ? new Date(job.followUpDate) : null;

    if (follow && follow > now) {
      const threeDaysOut = new Date(follow.getTime() - 3 * msDay);
      if (threeDaysOut > now) {
        await scheduleJobNotification(
          job,
          threeDaysOut,
          `📅 ${job.company}: Follow-up in 3 days`,
          `Your follow-up for ${job.role} is on ${follow.toLocaleDateString()}.`
        );
      }
      await scheduleJobNotification(
        job,
        follow,
        `🔔 ${job.company}: Follow-up today!`,
        `Today is your scheduled follow-up for ${job.role}. Tap to view details.`
      );
    } else {
      // No follow-up date → nudge 1 week after applying
      const oneWeek = new Date(appliedDate.getTime() + 7 * msDay);
      if (oneWeek > now) {
        await scheduleJobNotification(
          job,
          oneWeek,
          `📬 ${job.company}: Time to follow up?`,
          `It's been a week since you applied for ${job.role}. Any updates?`
        );
      }
    }
  }
}

async function scheduleJobNotification(
  job: JobApplication,
  date: Date,
  title: string,
  body: string
) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { jobId: job.id } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

// ─── Encouragement Notifications ─────────────────────────────────────────────
async function scheduleEncouragementNotifications() {
  const ENCOURAGEMENT_SCHEDULED_KEY = "jobflow_encouragement_last_scheduled";
  const raw = await AsyncStorage.getItem(ENCOURAGEMENT_SCHEDULED_KEY);
  const lastScheduled = raw ? parseInt(raw, 10) : 0;
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  // Don't reschedule if we already did within the last week
  if (Date.now() - lastScheduled < weekMs) return;

  // Pick 3 random unique messages from the pool
  const shuffled = [...ENCOURAGEMENTS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Spread them out: random time within day 2, 4, 6 from now
  const offsets = [2, 4, 6];

  for (let i = 0; i < selected.length; i++) {
    const msg = selected[i];
    // Random hour between 9am-7pm
    const randomHourMs = (9 + Math.floor(Math.random() * 10)) * 60 * 60 * 1000;
    const triggerDate = new Date(now + offsets[i] * dayMs + randomHourMs);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        data: { type: "encouragement" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }

  await AsyncStorage.setItem(ENCOURAGEMENT_SCHEDULED_KEY, now.toString());
}

// ─── Inactivity Reminder ──────────────────────────────────────────────────────
async function scheduleInactivityReminder() {
  const raw = await AsyncStorage.getItem("lastOpened");
  const last = raw ? parseInt(raw, 10) : Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const nextRemind = last + sevenDays;

  if (nextRemind > Date.now()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "👋 We miss you!",
        body: "It's been a while — tap to check your job applications and stay on track.",
        data: { type: "inactivity" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(nextRemind),
      },
    });
  }
}
