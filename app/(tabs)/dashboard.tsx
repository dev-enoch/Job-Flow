import { useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl } from "react-native";
import Text from "../../components/ui/Text";
import Card from "../../components/ui/Card";
import ScreenHeader from "../../components/ui/ScreenHeader";
import ProgressChart from "../../components/dashboard/ProgressChart";
import UpcomingReminders from "../../components/dashboard/UpcomingReminders";
import { useTheme } from "../../context/themeContext";
import { ThemeColors } from "../../constants/colors";
import { useJobs } from "../../context/jobContext";
import { MotiView } from "moti";
import { TrendingUp, Briefcase, CheckCircle, XCircle } from "lucide-react-native";
import {
  dimensions,
  motion,
  radius,
  spacing,
} from "../../constants/design-tokens";

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { jobs, refreshJobs } = useJobs();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshJobs();
    setRefreshing(false);
  };

  const totalJobs = jobs.length;
  const accepted = jobs.filter((j) => j.status === "accepted").length;
  const interviewing = jobs.filter((j) => j.status === "interviewing").length;
  const rejected = jobs.filter((j) => j.status === "rejected").length;

  const stats = [
    { label: "Total", value: totalJobs, icon: <Briefcase size={20} color={theme.primary} />, bg: theme.primaryLight, color: theme.primary },
    { label: "Accepted", value: accepted, icon: <CheckCircle size={20} color={theme.success} />, bg: theme.successLight, color: theme.success },
    { label: "Interviewing", value: interviewing, icon: <TrendingUp size={20} color={theme.warning} />, bg: theme.warningLight, color: theme.warning },
    { label: "Rejected", value: rejected, icon: <XCircle size={20} color={theme.error} />, bg: theme.errorLight, color: theme.error },
  ];

  return (
    // Root layout already provides the top safe-area inset.
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        <MotiView
          from={{ opacity: 0, translateY: -15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: motion.slow, type: "timing" }}
        >
          <ScreenHeader title="Dashboard" subtitle="Your job hunt at a glance" />
        </MotiView>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <MotiView
              key={stat.label}
              from={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: i * 80, damping: 15, stiffness: 120 }}
              style={styles.statCardWrapper}
            >
              <Card variant="elevated" style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: stat.bg }]}>
                  {stat.icon}
                </View>
                <Text variant="h1" weight="bold" style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text variant="label" color="secondary">
                  {stat.label}
                </Text>
              </Card>
            </MotiView>
          ))}
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: motion.slow, delay: 200 }}
          style={styles.sections}
        >
          <ProgressChart jobs={jobs} />
          <UpcomingReminders jobs={jobs} />
        </MotiView>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      // Horizontal padding lives on the sections (ScreenHeader pads
      // itself), so the header title and the cards share one 16px edge.
      paddingBottom: spacing.xxxl,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: dimensions.sectionGap,
      paddingHorizontal: dimensions.screenPadding,
      gap: spacing.md,
    },
    sections: {
      paddingHorizontal: dimensions.screenPadding,
    },
    statCardWrapper: {
      width: "47%",
    },
    statCard: {
      padding: dimensions.cardPadding,
      alignItems: "flex-start",
    },
    statIconWrap: {
      width: spacing.huge,
      height: spacing.huge,
      borderRadius: radius.lg,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    statValue: {
      marginBottom: spacing.xs,
    },
  });
};
