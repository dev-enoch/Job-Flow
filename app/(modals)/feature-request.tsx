import { View, StyleSheet, ScrollView, Alert, Linking, SafeAreaView } from "react-native";
import { useTheme } from "../../context/themeContext";
import { useRouter } from "expo-router";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Text from "../../components/ui/Text";
import Card from "../../components/ui/Card";
import { useState } from "react";
import { ThemeColors } from "../../constants/colors";
import { MotiView } from "moti";
import { ArrowLeft, Lightbulb, User, Mail, MessageSquareText, Send } from "lucide-react-native";

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Button
          variant="outline"
          title=""
          leftIcon={<ArrowLeft size={20} color={theme.text.primary} />}
          onPress={() => router.back()}
          style={styles.backBtn}
        />
        <Text variant="h3" weight="bold" style={styles.headerTitle}>Feature Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
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
          <Text style={styles.paragraph} align="center">
            We're constantly improving JobFlow. Let us know what you want to see next!
          </Text>

          <Card variant="elevated" style={styles.card}>
            <Input
              label="Your Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              style={styles.input}
              leftIcon={<User size={18} color={theme.text.secondary} />}
            />

            <Input
              label="Your Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border + "50",
    },
    backBtn: {
      width: 44,
      height: 44,
      paddingHorizontal: 0,
      justifyContent: 'center',
      borderRadius: 22,
    },
    headerTitle: {
      color: theme.text.primary,
    },
    container: {
      flex: 1,
    },
    content: {
      padding: 24,
      paddingBottom: 40,
    },
    iconWrapper: {
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 10,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.warningLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      marginBottom: 8,
      color: theme.text.primary,
    },
    paragraph: {
      marginBottom: 32,
      color: theme.text.secondary,
      lineHeight: 24,
      paddingHorizontal: 10,
    },
    card: {
      padding: 24,
    },
    input: {
      marginBottom: 20,
    },
    textArea: {
      height: 140,
      marginBottom: 32,
      textAlignVertical: "top",
    },
    submitButton: {
      width: '100%',
      borderRadius: 24,
    },
  });
