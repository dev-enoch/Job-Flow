import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../context/themeContext";
import {
  dimensions,
  radius,
  spacing,
} from "../../constants/design-tokens";

const TabButton = ({
  active,
  onPress,
  icon,
  title,
}: {
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  title: string;
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        active && { backgroundColor: theme.primaryLight },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.tabContent}>
        {icon}
        <Text style={[styles.tabText, active && { color: theme.primary }]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    // Minimum 44x44 touch target.
    minHeight: dimensions.minTouchTarget,
    justifyContent: "center",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default TabButton;
