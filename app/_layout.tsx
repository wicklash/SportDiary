import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { theme } from "./theme/theme";

export default function RootLayout() {
  useEffect(() => {
    // Uygulama genel arka planını sistem düzeyinde koyu renge sabitle
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.colors.background },
          animationTypeForReplace: 'push',
          gestureEnabled: true,
          statusBarStyle: 'light',
          statusBarAnimation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
