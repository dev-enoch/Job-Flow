import { View, StyleSheet } from "react-native";
import Text from "../ui/Text";
import { JobStatus, useStatusConfig } from "../../constants/jobStatus";
import { radius, spacing } from "../../constants/design-tokens";

export default function StatusPill({
  status,
  style,
}: {
  status: JobStatus;
  style?: any;
}) {
  // Theme-aware colours from the shared status config (the previous
  // hardcoded light-mode hex values looked wrong in dark mode).
  const { statusConfig } = useStatusConfig();
  const { color, background, label } = statusConfig[status];

  return (
    <View style={[styles.container, { backgroundColor: background }, style]}>
      <Text variant="label" style={{ color }} weight="medium">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
  },
});
