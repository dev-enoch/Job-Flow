import { StyleSheet, View, ScrollView } from "react-native";
import { useTheme } from "../../context/themeContext";
import Text from "../../components/ui/Text";
import ScreenHeader from "../../components/ui/ScreenHeader";
import { ThemeColors } from "../../constants/colors";
import { useJobs } from "../../context/jobContext";
import Card from "../../components/ui/Card";
import { MotiView } from "moti";
import { getStatusCounts } from "../../utils/jobUtils";
import {
  dimensions,
  motion,
  radius,
  spacing,
} from "../../constants/design-tokens";

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
        // Root layout already provides the top safe-area inset.
        <View style={styles.container}>
            <ScreenHeader title="Insights" />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: motion.slow }}
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
                                                transition={{ duration: motion.slow, delay: index * 200 }}
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
        </View>
    );
}

const createStyles = (theme: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        content: {
            flex: 1,
            paddingHorizontal: dimensions.screenPadding,
        },
        contentContainer: {
            paddingTop: spacing.lg,
            paddingBottom: spacing.xxxl,
        },
        subtitle: {
            marginBottom: dimensions.sectionGap,
        },
        funnelCard: {
            padding: dimensions.cardPadding,
            marginBottom: dimensions.sectionGap,
        },
        cardTitle: {
            marginBottom: spacing.lg,
            color: theme.text.primary,
        },
        funnelContainer: {
            gap: spacing.lg,
        },
        funnelRow: {
            // Gap on the container spaces the rows.
        },
        funnelLabel: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: spacing.sm,
        },
        barBackground: {
            height: spacing.md,
            backgroundColor: theme.border,
            borderRadius: radius.sm,
            overflow: "hidden",
        },
        barFill: {
            height: "100%",
            borderRadius: radius.sm,
        },
        percentText: {
            marginTop: spacing.xs,
            textAlign: "right",
        },
    });
