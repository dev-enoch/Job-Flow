import { View, StyleSheet, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { Bell, ChevronRight } from "lucide-react-native";
import Card from "../../components/ui/Card";
import Text from "../../components/ui/Text";
import { JobApplication } from "../../types/jobs";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/themeContext";
import { MotiView } from "moti";
import {
  dimensions,
  motion,
  radius,
  spacing,
  touchHitSlop,
} from "../../constants/design-tokens";

interface UpcomingRemindersProps {
  jobs: JobApplication[];
}

export default function UpcomingReminders({ jobs }: UpcomingRemindersProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const jobsWithFollowUps = jobs
    .filter(
      (job) => job.followUpDate && new Date(job.followUpDate) >= new Date()
    )
    .sort((a, b) => {
      const dateA = new Date(a.followUpDate || 0);
      const dateB = new Date(b.followUpDate || 0);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  const handleViewAll = () => {
    router.push("/(tabs)");
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: motion.slow, delay: 200 }}
    >
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <Text variant="h3" weight="bold">
            Upcoming Follow-ups
          </Text>
          <TouchableOpacity
            onPress={handleViewAll}
            style={styles.viewAll}
            hitSlop={touchHitSlop}
          >
            <Text color="primary" weight="medium">
              View all
            </Text>
            <ChevronRight size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {jobsWithFollowUps.length > 0 ? (
          jobsWithFollowUps.map((job, index) => (
            <MotiView
              key={job.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 200 + index * 100, type: "spring", damping: 14 }}
            >
              <TouchableOpacity
                style={styles.reminderItem}
                activeOpacity={0.8}
                onPress={() => router.push(`/(modals)/job/${job.id}`)}
              >
                <View style={styles.reminderIcon}>
                  <Bell size={18} color={theme.primary} />
                </View>
                <View style={styles.reminderContent}>
                  <Text weight="medium" numberOfLines={1}>
                    {job.role} at {job.company}
                  </Text>
                  <Text variant="label" color="secondary">
                    Follow up on{" "}
                    {format(new Date(job.followUpDate!), "MMM d, yyyy")}
                  </Text>
                </View>
              </TouchableOpacity>
            </MotiView>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text color="secondary" style={styles.emptyText}>
              No upcoming follow-ups scheduled.
            </Text>
          </View>
        )}
      </Card>
    </MotiView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      // Last card on the dashboard; the screen's bottom padding applies.
      marginBottom: 0,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    viewAll: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.xs,
    },
    reminderItem: {
      flexDirection: "row",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    reminderIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
    },
    reminderContent: {
      flex: 1,
    },
    emptyState: {
      padding: spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      textAlign: "center",
    },
  });
