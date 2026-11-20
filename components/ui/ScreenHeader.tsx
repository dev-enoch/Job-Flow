import { View, StyleSheet, ViewStyle } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "../../context/themeContext";
import Text from "./Text";
import IconButton from "./IconButton";
import {
  dimensions,
  spacing,
} from "../../constants/design-tokens";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** When set, a 44x44 back button is shown and the title is centred. */
  onBack?: () => void;
  /** Optional action(s) pinned to the right (tab screens). */
  right?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Standard 56px screen header.
 * - Tab screens: left-aligned screen title (28–30) with optional subtitle.
 * - Modal screens: pass `onBack` for a centred title with a back button
 *   and a hairline divider, matching the existing modal headers.
 */
export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  style,
}: ScreenHeaderProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (onBack) {
    return (
      <View style={[styles.modalHeader, style]}>
        <IconButton variant="outline" onPress={onBack}>
          <ArrowLeft size={20} color={theme.text.primary} />
        </IconButton>
        <Text variant="h3" weight="bold" align="center" style={styles.modalTitle}>
          {title}
        </Text>
        {/* Spacer matching the back button so the title stays centred. */}
        <View style={styles.modalSpacer} />
      </View>
    );
  }

  return (
    <View style={[styles.header, style]}>
      <View style={styles.titleBlock}>
        <Text variant="title" weight="bold" style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: dimensions.headerHeight,
      paddingHorizontal: dimensions.screenPadding,
      paddingVertical: spacing.sm,
    },
    titleBlock: {
      flex: 1,
    },
    title: {
      color: theme.text.primary,
      letterSpacing: -0.5,
    },
    subtitle: {
      marginTop: spacing.xs,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: dimensions.headerHeight,
      paddingHorizontal: dimensions.screenPadding,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider + "80",
    },
    modalTitle: {
      flex: 1,
      color: theme.text.primary,
    },
    modalSpacer: {
      width: dimensions.minTouchTarget,
    },
  });
