import {
  Text as RNText,
  StyleSheet,
  TextProps as RNTextProps,
} from "react-native";
import { useTheme } from "../../context/themeContext";
import { lightThemeColors } from "../../constants/colors";
import { typography, TypographyVariant } from "../../constants/design-tokens";

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: keyof typeof lightThemeColors.text | string;
  weight?: "regular" | "medium" | "bold";
  align?: "left" | "center" | "right";
}

export default function Text({
  children,
  variant = "body",
  color = "primary",
  weight = "regular",
  align = "left",
  style,
  ...props
}: TextProps) {
  const { theme } = useTheme();
  const styles = createStyles();

  const resolvedColor =
    typeof color === "string" && color in theme.text
      ? theme.text[color as keyof typeof theme.text]
      : color;

  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        styles[weight],
        { color: resolvedColor, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const createStyles = () =>
  StyleSheet.create({
    base: {
      fontFamily: "Inter-Regular",
    },
    // Type scale from constants/design-tokens.ts — display 36 down to
    // micro 11. Screen titles use `title` (30), section headings `h2`/`h3`.
    display: typography.display,
    title: typography.title,
    h1: typography.h1,
    h2: typography.h2,
    h3: typography.h3,
    h4: typography.h4,
    body: typography.body,
    bodySmall: typography.bodySmall,
    label: typography.label,
    caption: typography.caption,
    micro: typography.micro,
    regular: {
      fontFamily: "Inter-Regular",
    },
    medium: {
      fontFamily: "Inter-Medium",
    },
    bold: {
      fontFamily: "Inter-Bold",
    },
  });
