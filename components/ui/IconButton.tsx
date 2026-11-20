import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useTheme } from "../../context/themeContext";
import {
  dimensions,
  touchHitSlop,
} from "../../constants/design-tokens";

interface IconButtonProps extends TouchableOpacityProps {
  /** Diameter in px. Defaults to the 44px minimum touch target. */
  size?: number;
  variant?: "ghost" | "outline" | "filled";
  children: React.ReactNode;
}

/**
 * Square icon-only button that always meets the 44x44 minimum touch
 * target. Use for back/close/clear actions in headers and sheets.
 */
export default function IconButton({
  size = dimensions.minTouchTarget,
  variant = "ghost",
  children,
  style,
  ...props
}: IconButtonProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor:
            variant === "filled"
              ? theme.primaryLight
              : variant === "outline"
              ? "transparent"
              : "transparent",
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: theme.border,
        },
        style,
      ]}
      activeOpacity={0.7}
      // Guarantees a 44x44 hit area even for a smaller visible button.
      hitSlop={size < dimensions.minTouchTarget ? touchHitSlop : undefined}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
  },
});
