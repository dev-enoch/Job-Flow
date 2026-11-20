import { View, StyleSheet } from "react-native";
import Text from "../../components/ui/Text";
import { JobStatus, useStatusConfig } from "../../constants/jobStatus";
import { radius, spacing } from "../../constants/design-tokens";

interface StatusBadgeProps {
  status: JobStatus;
  size?: "small" | "medium";
}

export default function StatusBadge({
  status,
  size = "medium",
}: StatusBadgeProps) {
  const { statusConfig } = useStatusConfig();
  const { color, background, label } = statusConfig[status];

  return (
    <View style={[styles.badge, { backgroundColor: background }, styles[size]]}>
      <Text
        variant={size === "small" ? "caption" : "label"}
        style={[styles.text, { color }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontFamily: "Inter-Medium",
  },
});
