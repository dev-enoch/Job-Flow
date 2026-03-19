import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Card from "../../components/ui/Card";
import Text from "../../components/ui/Text";
import { JobApplication } from "../../types/jobs";
import { getStatusCounts } from "../../utils/jobUtils";
import { useStatusConfig } from "../../constants/jobStatus";
import { useTheme } from "../../context/themeContext";
import { MotiView } from "moti";
import { PieChart } from "react-native-svg-charts";
import { G, Circle, Text as SVGText } from "react-native-svg";

interface ProgressChartProps {
  jobs: JobApplication[];
}

const { width } = Dimensions.get("window");
const CHART_SIZE = width > 600 ? 300 : width - 64;

export default function ProgressChart({ jobs }: ProgressChartProps) {
  const statusCounts = getStatusCounts(jobs);
  const total = jobs.length;
  const { statusConfig } = useStatusConfig();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Prepare data for PieChart
  const pieData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count], index) => {
      const config = statusConfig[status as keyof typeof statusConfig];
      return {
        key: `pie-${status}`,
        value: count,
        svg: { fill: config.color },
        arc: { outerRadius: "100%", cornerRadius: 5 },
        label: config.label,
        percentage: ((count / total) * 100).toFixed(1),
      };
    });

  // Custom Labels for the slices
  const Labels = ({ slices }: any) => {
    return slices.map((slice: any, index: number) => {
      const { pieCentroid, data } = slice;
      return (
        <SVGText
          key={`label-${index}`}
          x={pieCentroid[0]}
          y={pieCentroid[1]}
          fill="white"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={14}
          fontWeight="bold"
        >
          {data.percentage}%
        </SVGText>
      );
    });
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 600 }}
    >
      <Card variant="elevated" style={styles.card}>
        <Text variant="h3" weight="bold" style={styles.title}>
          Application Progress
        </Text>

        <View style={styles.chartContainer}>
          {total === 0 ? (
            <Text>No applications yet</Text>
          ) : (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 300, duration: 800 }}
            >
              <PieChart
                style={{ height: CHART_SIZE, width: CHART_SIZE }}
                data={pieData}
                outerRadius="95%"
                innerRadius="40%"
                padAngle={0.02}
              >
                <Labels />
              </PieChart>
            </MotiView>
          )}
        </View>

        <View style={styles.legendContainer}>
          {pieData.map(({ key, svg, label, value }, index) => (
            <MotiView
              key={key}
              style={styles.legendItem}
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 400 + (index * 100) }}
            >
              <View style={[styles.legendDot, { backgroundColor: svg.fill }]} />
              <Text variant="label" style={styles.legendLabel}>
                {label} ({value})
              </Text>
            </MotiView>
          ))}
        </View>

        <MotiView
          style={styles.summary}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 700 }}
        >
          <Text variant="body" weight="medium">
            Total: {total} application{total !== 1 ? "s" : ""}
          </Text>
        </MotiView>
      </Card>
    </MotiView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      marginBottom: 20,
    },
    title: {
      marginBottom: 16,
      color: theme.text.primary,
    },
    chartContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    legendContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 20,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 10,
      marginBottom: 8,
    },
    legendDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginRight: 8,
    },
    legendLabel: {
      color: theme.text.primary,
    },
    summary: {
      marginTop: 16,
      alignItems: "center",
    },
  });
