import { useTheme } from "../context/themeContext";
import Toast, { BaseToast, BaseToastProps } from "react-native-toast-message";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  BriefcaseIcon,
} from "lucide-react-native";
import Text from "../components/ui/Text";
import { radius, spacing } from "../constants/design-tokens";

/* ───────────────────────────────────────────
   iPhone Dynamic Island-style pill toast.
   Appears at the very top, pill-shaped,
   blurred background, small condensed layout.
─────────────────────────────────────────── */

function PillToast({
  icon,
  accent,
  text1,
  text2,
  cardBg,
  borderColor,
}: {
  icon: React.ReactNode;
  accent: string;
  text1?: string;
  text2?: string;
  cardBg: string;
  borderColor: string;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: cardBg, borderColor }]}>
      <View style={[styles.iconWrap, { backgroundColor: accent + "20" }]}>
        {icon}
      </View>
      <View style={styles.textWrap}>
        {text1 ? (
          <Text
            style={[styles.text1, { color: accent }]}
            numberOfLines={1}
            weight="bold"
          >
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text
            style={styles.text2}
            numberOfLines={2}
          >
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function ThemedToast() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const toastConfig = {
    success: ({ text1, text2 }: any) => (
      <PillToast
        icon={<CheckCircle2 size={18} color={theme.success} />}
        accent={theme.success}
        text1={text1}
        text2={text2}
        cardBg={theme.card}
        borderColor={theme.success + "40"}
      />
    ),
    error: ({ text1, text2 }: any) => (
      <PillToast
        icon={<AlertCircle size={18} color={theme.error} />}
        accent={theme.error}
        text1={text1}
        text2={text2}
        cardBg={theme.card}
        borderColor={theme.error + "40"}
      />
    ),
    info: ({ text1, text2 }: any) => (
      <PillToast
        icon={<Info size={18} color={theme.accent} />}
        accent={theme.accent}
        text1={text1}
        text2={text2}
        cardBg={theme.card}
        borderColor={theme.accent + "40"}
      />
    ),
    job: ({ text1, text2 }: any) => (
      <PillToast
        icon={<BriefcaseIcon size={18} color={theme.primary} />}
        accent={theme.primary}
        text1={text1}
        text2={text2}
        cardBg={theme.card}
        borderColor={theme.primary + "40"}
      />
    ),
  };

  return (
    <Toast
      config={toastConfig}
      position="top"
      // Real safe-area inset, never a hardcoded status-bar height.
      topOffset={insets.top + spacing.sm}
      visibilityTime={3000}
    />
  );
}

// Expose a helper so callers don't need to import Toast directly
export const showToast = {
  success: (text1: string, text2?: string) =>
    Toast.show({ type: "success", text1, text2, visibilityTime: 3000 }),
  error: (text1: string, text2?: string) =>
    Toast.show({ type: "error", text1, text2, visibilityTime: 4000 }),
  info: (text1: string, text2?: string) =>
    Toast.show({ type: "info", text1, text2, visibilityTime: 3000 }),
  job: (text1: string, text2?: string) =>
    Toast.show({ type: "job", text1, text2, visibilityTime: 3500 }),
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    minWidth: 200,
    maxWidth: "88%",
    // Shadow for iPhone-like depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
  },
  text1: {
    fontSize: 14,
    lineHeight: 20,
  },
  text2: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
});
