import { Stack } from "expo-router";
import { useTheme } from "../../context/themeContext";

export default function ModalLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: false, // All modal screens draw their own headers
        contentStyle: {
          backgroundColor: theme.background,
        },
        animation: "slide_from_bottom",
      }}
    >
      <Stack.Screen name="add-job" />
      <Stack.Screen name="about" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="backup" />
      <Stack.Screen name="restore" />
      <Stack.Screen name="feature-request" />
      <Stack.Screen name="job" />
    </Stack>
  );
}
