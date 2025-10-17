import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="measure" />
      <Stack.Screen name="calibration" />
      <Stack.Screen name="projects" />
    </Stack>
  );
}