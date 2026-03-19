import { useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "../../components/ui/Text";
import Card from "../../components/ui/Card";
import ProgressChart from "../../components/dashboard/ProgressChart";
import UpcomingReminders from "../../components/dashboard/UpcomingReminders";
import { useTheme } from "../../context/themeContext";
import { ThemeColors } from "../../constants/colors";
import { useJobs } from "../../context/jobContext";
import { MotiView } from "moti";
import { TrendingUp, Briefcase, CheckCircle, XCircle } from "lucide-react-native";

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
    <SafeAreaView style={styles.container} edges={["top"]}>
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
          transition={{ duration: 400, type: "timing" }}
          style={styles.header}
        >
          <View>
            <Text variant="h1" weight="bold" style={styles.headerTitle}>
              Dashboard
            </Text>
            <Text variant="caption" color="secondary">
              Your job hunt at a glance
            </Text>
          </View>
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
                <Text style={[styles.statValue, { color: stat.color }]} weight="bold">
                  {stat.value}
                </Text>
                <Text variant="caption" color="secondary" style={styles.statLabel}>
                  {stat.label}
                </Text>
              </Card>
            </MotiView>
          ))}
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 300 }}
        >
          <ProgressChart jobs={jobs} />
          <UpcomingReminders jobs={jobs} />
        </MotiView>
      </ScrollView>
    </SafeAreaView>
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
      padding: 16,
      paddingBottom: 40,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    headerTitle: {
      fontSize: 30,
      letterSpacing: -0.5,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 8,
      gap: 12,
    },
    statCardWrapper: {
      width: "47%",
    },
    statCard: {
      padding: 16,
      alignItems: "flex-start",
    },
    statIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    statValue: {
      fontSize: 28,
      lineHeight: 34,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 13,
    },
  });
};
