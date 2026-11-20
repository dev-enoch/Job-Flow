import { View, TouchableOpacity, StyleSheet } from "react-native";
import { format } from "date-fns";
import { ChevronRight, Calendar, Building2, MapPin } from "lucide-react-native";
import { MotiView } from "moti";
import StatusBadge from "./StatusBadge";
import Card from "../ui/Card";
import Text from "../ui/Text";
import { useTheme } from "../../context/themeContext";
import { JobApplication } from "../../types/jobs";
import { radius, spacing } from "../../constants/design-tokens";

interface JobCardProps {
  job: JobApplication;
  index: number;
  onPress: (job: JobApplication) => void;
}

export default function JobCard({ job, index, onPress }: JobCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "spring",
        delay: Math.min(index * 80, 800),
        damping: 20,
        stiffness: 100,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(job)}
        style={styles.container}
      >
        <Card variant="elevated" style={styles.card}>
          <View style={styles.mainContent}>
            <View style={styles.textContent}>
              <Text variant="body" weight="bold" style={styles.roleTitle} numberOfLines={1}>
                {job.role}
              </Text>
              <View style={styles.metaRow}>
                <Building2 size={14} color={theme.text.secondary} />
                <Text variant="label" color="secondary" style={styles.companyText} numberOfLines={1}>
                  {job.company}
                </Text>
                {job.location && (
                  <>
                    <View style={styles.dotSeparator} />
                    <MapPin size={14} color={theme.text.secondary} />
                    <Text variant="label" color="secondary" style={styles.locationText} numberOfLines={1}>
                      {job.location}
                    </Text>
                  </>
                )}
              </View>
            </View>

            <ChevronRight size={18} color={theme.border} />
          </View>

          <View style={styles.footer}>
            <StatusBadge status={job.status} />
            <View style={styles.dateWrap}>
              <Calendar size={12} color={theme.text.secondary} />
              <Text variant="caption" color="secondary">
                {format(new Date(job.dateApplied), "MMM d, yyyy")}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </MotiView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    card: {
      borderLeftWidth: 3,
      borderLeftColor: theme.primary + "40",
    },
    mainContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: spacing.md,
    },
    textContent: {
      flex: 1,
      marginRight: spacing.sm,
    },
    roleTitle: {
      color: theme.text.primary,
      marginBottom: spacing.sm,
      letterSpacing: -0.2,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    companyText: {
      marginLeft: 5,
      marginRight: spacing.xs,
    },
    locationText: {
      marginLeft: 5,
      maxWidth: 100,
    },
    dotSeparator: {
      width: 3,
      height: 3,
      borderRadius: radius.full,
      backgroundColor: theme.border,
      marginHorizontal: spacing.sm,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
  });
