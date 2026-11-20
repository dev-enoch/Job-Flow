import { View, StyleSheet, ScrollView, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/themeContext";
import { useRouter } from "expo-router";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Text from "../../components/ui/Text";
import Card from "../../components/ui/Card";
import ScreenHeader from "../../components/ui/ScreenHeader";
import { useState } from "react";
import { ThemeColors } from "../../constants/colors";
import { MotiView } from "moti";
import { Lightbulb, User, Mail, MessageSquareText, Send } from "lucide-react-native";
import {
  dimensions,
  motion,
  radius,
  spacing,
} from "../../constants/design-tokens";

export default function FeatureRequestModal() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [featureRequest, setFeatureRequest] = useState("");

  const handleSubmit = async () => {
    if (!name || !email || !featureRequest) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    const subject = encodeURIComponent(`Feature Request from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nFeature Request:\n${featureRequest}`
    );

    const mailtoUrl = `mailto:arhyelphilip024@gmail.com?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      Linking.openURL(mailtoUrl);
      router.back();
    } else {
      Alert.alert("Error", "Unable to open the mail app.");
    }
  };

  return (
    // Root layout owns the top inset; this modal owns the bottom one.
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScreenHeader title="Feature Request" onBack={() => router.back()} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: motion.slow }}
          style={styles.content}
        >
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <Lightbulb size={36} color={theme.warning} />
            </View>
          </View>

          <Text variant="h2" weight="bold" style={styles.title} align="center">
            Got an idea?
          </Text>
          <Text variant="bodySmall" color="secondary" style={styles.paragraph} align="center">
            We're constantly improving JobFlow. Let us know what you want to see next!
          </Text>

          <Card variant="elevated" style={styles.card}>
            <Input
              label="Your Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={18} color={theme.text.secondary} />}
            />

            <Input
              label="Your Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={18} color={theme.text.secondary} />}
            />

            <Input
              label="Your Feature Request"
              placeholder="Describe the feature you'd like to see..."
              value={featureRequest}
              onChangeText={setFeatureRequest}
              multiline
              numberOfLines={6}
              style={styles.textArea}
              leftIcon={<MessageSquareText size={18} color={theme.text.secondary} style={{ marginTop: 8 }} />}
            />

            <Button
              title="Submit Request"
              leftIcon={<Send size={18} color={theme.background} />}
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </Card>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    content: {
      padding: dimensions.screenPadding,
      paddingBottom: spacing.xxxl,
    },
    iconWrapper: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      marginTop: spacing.sm,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: radius.full,
      backgroundColor: theme.warningLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      marginBottom: spacing.sm,
      color: theme.text.primary,
    },
    paragraph: {
      marginBottom: spacing.xxxl,
      paddingHorizontal: spacing.sm,
    },
    card: {
      padding: dimensions.cardPadding,
    },
    textArea: {
      height: 140,
      textAlignVertical: "top",
    },
    submitButton: {
      width: '100%',
      borderRadius: radius.xxl,
    },
  });
