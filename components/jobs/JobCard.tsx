import { View, TouchableOpacity, StyleSheet } from "react-native";
import { format } from "date-fns";
import { ChevronRight, Calendar, Building2, MapPin } from "lucide-react-native";
import { MotiView } from "moti";
import StatusBadge from "./StatusBadge";
import Card from "../ui/Card";
import Text from "../ui/Text";
import { useTheme } from "../../context/themeContext";
import { JobApplication } from "../../types/jobs";

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
              <Text weight="bold" style={styles.roleTitle} numberOfLines={1}>
                {job.role}
              </Text>
              <View style={styles.metaRow}>
                <Building2 size={13} color={theme.text.secondary} />
                <Text style={styles.companyText} numberOfLines={1}>
                  {job.company}
                </Text>
                {job.location && (
                  <>
                    <View style={styles.dotSeparator} />
                    <MapPin size={13} color={theme.text.secondary} />
                    <Text style={styles.locationText} numberOfLines={1}>
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
              <Text style={styles.dateText}>
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
      marginBottom: 12,
    },
    card: {
      padding: 16,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary + "40",
    },
    mainContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    textContent: {
      flex: 1,
      marginRight: 8,
    },
    roleTitle: {
      fontSize: 16,
      color: theme.text.primary,
      marginBottom: 6,
      letterSpacing: -0.2,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    companyText: {
      fontSize: 13,
      color: theme.text.secondary,
      marginLeft: 5,
      marginRight: 4,
    },
    locationText: {
      fontSize: 13,
      color: theme.text.secondary,
      marginLeft: 5,
      maxWidth: 100,
    },
    dotSeparator: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: theme.border,
      marginHorizontal: 6,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    dateText: {
      fontSize: 12,
      color: theme.text.secondary,
    },
  });
