import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="pages/(tabs)" />
      <Stack.Screen name="pages/program-details/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="pages/day-details/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
