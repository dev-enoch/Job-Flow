import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../context/authContext";
import { useFrameworkReady } from "../hooks/useFrameworkReady";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { ThemeProvider, useTheme } from "../context/themeContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Provider } from "react-native-paper";
import ThemedToast from "../utils/toast";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import { JobsProvider } from "../context/jobContext";
import { NotificationProvider } from "../context/NotificationContext";
import AnimatedSplash from "../components/AnimatedSplash";

// Hold the native splash until we manually dismiss it
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-Bold": Inter_700Bold,
  });

  useFrameworkReady();

  // Step 1: hide the native splash as soon as fonts are ready,
  // then let our JS animated splash take over seamlessly.
  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppReady(true);
      // Hide the OS splash — our black AnimatedSplash is already visible
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // While fonts/framework are loading, keep the native splash visible
  if (!appReady) {
    return null; // Native splash is still showing, return nothing
  }

  return (
    <Provider>
      <AuthProvider>
        <ThemeProvider>
          <JobsProvider>
            <NotificationProvider>
              <AppInitializer />
            </NotificationProvider>
          </JobsProvider>
        </ThemeProvider>
      </AuthProvider>

      {/* Animated splash renders on top of everything until complete */}
      {showAnimatedSplash && (
        <AnimatedSplash onComplete={() => setShowAnimatedSplash(false)} />
      )}
    </Provider>
  );
}

function AppInitializer() {
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background);
  }, [theme]);

  return (
    <>
      <SafeAreaProvider>
        {/* Top/left/right insets are owned here. The bottom inset is owned
            by the tab bar (64 + safe area) and by modal screens, so content
            never gets double bottom padding. */}
        <SafeAreaView
          edges={["top", "left", "right"]}
          style={[styles.safeArea, { backgroundColor: theme.background }]}
        >
          <StatusBar
            backgroundColor={theme.background}
            style={isDarkMode ? "light" : "dark"}
          />
          <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(modals)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SafeAreaView>
        {/* Inside the provider so the toast can read the real safe area. */}
        <ThemedToast />
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
