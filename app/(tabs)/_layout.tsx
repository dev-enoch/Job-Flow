import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Home, Briefcase, PieChart, Settings } from "lucide-react-native";
import { useTheme } from "../../context/themeContext";
import { ThemeColors } from "../../constants/colors";
import { StatusBar } from "expo-status-bar";
import Onboarding from "../../components/onBoarding";
import logger from "../../utils/logger";
import { dimensions, spacing } from "../../constants/design-tokens";

export default function TabLayout() {
  const { theme, isDarkMode } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem("@onboarding_completed");
        setShowOnboarding(value !== "true");
      } catch (error) {
        logger.error("Error checking onboarding:", error);
        setShowOnboarding(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("@onboarding_completed", "true");
      setShowOnboarding(false);
    } catch (error) {
      logger.error("Error saving onboarding status:", error);
    }
  };

  return (
    <>
      <StatusBar
        backgroundColor={theme.background}
        style={isDarkMode ? "light" : "dark"}
      />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.text.secondary,
          // Guide: tab bar 64 + bottom safe area, 22–24 icons, 10–12 labels.
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.divider,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom,
            height: dimensions.tabBarHeight + insets.bottom,
          },
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
          tabBarShowLabel: true,
          animation: "shift",
        }}
        initialRouteName="index"
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => (
              <Briefcase color={color} size={dimensions.tabIconSize} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Applications",
            tabBarIcon: ({ color }) => (
              <Home color={color} size={dimensions.tabIconSize} />
            ),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color }) => (
              <PieChart color={color} size={dimensions.tabIconSize} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <Settings color={color} size={dimensions.tabIconSize} />
            ),
          }}
        />
      </Tabs>

      <Modal
        animationType="slide"
        presentationStyle="fullScreen"
        visible={showOnboarding}
        onRequestClose={completeOnboarding}
      >
        <Onboarding onComplete={completeOnboarding} />
      </Modal>
    </>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    tabBarLabel: {
      fontSize: dimensions.tabLabelSize,
      fontWeight: "500",
      fontFamily: "Inter-Medium",
    },
  });
