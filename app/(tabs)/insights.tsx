import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/themeContext";
import Text from "../../components/ui/Text";
import { ThemeColors } from "../../constants/colors";
import { useJobs } from "../../context/jobContext";
import Card from "../../components/ui/Card";
import { MotiView } from "moti";
import { getStatusCounts } from "../../utils/jobUtils";

export default function InsightsScreen() {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { jobs } = useJobs();

    const total = jobs.length;
    const statusCounts = getStatusCounts(jobs);
    const interviewing = statusCounts["interviewing"] || 0;
    const offered = statusCounts["offered"] || 0;
    const rejected = statusCounts["rejected"] || 0;

    const funnelData = [
        { label: "Total Applications", value: total, color: theme.primary },
        { label: "Interviews", value: interviewing, color: theme.warning },
        { label: "Offers", value: offered, color: theme.success },
        { label: "Rejections", value: rejected, color: theme.error },
    ];

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text variant="h1" weight="bold">
                    Insights
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 500 }}
                >
                    <Text variant="body" color="secondary" style={styles.subtitle}>
                        Analyze your job search pipeline
                    </Text>

                    <Card variant="elevated" style={styles.funnelCard}>
                        <Text variant="h3" weight="bold" style={styles.cardTitle}>
                            Application Funnel
                        </Text>

                        <View style={styles.funnelContainer}>
                            {funnelData.map((item, index) => {
                                const percentage = total > 0 ? (item.value / total) * 100 : 0;

                                return (
                                    <MotiView
                                        key={item.label}
                                        from={{ opacity: 0, scaleX: 0 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        transition={{
                                            type: "spring",
                                            delay: index * 150,
                                            damping: 15,
                                        }}
                                        style={styles.funnelRow}
                                    >
                                        <View style={styles.funnelLabel}>
                                            <Text variant="body" weight="medium">
                                                {item.label}
                                            </Text>
                                            <Text variant="h4" weight="bold" color="primary">
                                                {item.value}
                                            </Text>
                                        </View>

                                        <View style={styles.barBackground}>
                                            <MotiView
                                                from={{ width: "0%" }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1000, delay: index * 200 }}
                                                style={[styles.barFill, { backgroundColor: item.color }]}
                                            />
                                        </View>

                                        <Text variant="caption" color="secondary" style={styles.percentText}>
                                            {percentage.toFixed(1)}%
                                        </Text>
                                    </MotiView>
                                );
                            })}
                        </View>
                    </Card>
                </MotiView>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
        },
        content: {
            flex: 1,
            paddingHorizontal: 16,
            paddingTop: 16,
        },
        subtitle: {
            marginBottom: 24,
        },
        funnelCard: {
            padding: 16,
            marginBottom: 24,
        },
        cardTitle: {
            marginBottom: 16,
            color: theme.text.primary,
        },
        funnelContainer: {
            gap: 16,
        },
        funnelRow: {
            marginBottom: 12,
        },
        funnelLabel: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
        },
        barBackground: {
            height: 12,
            backgroundColor: theme.border,
            borderRadius: 6,
            overflow: "hidden",
        },
        barFill: {
            height: "100%",
            borderRadius: 6,
        },
        percentText: {
            marginTop: 4,
            textAlign: "right",
        },
    });
