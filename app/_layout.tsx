// app/_layout.tsx
import { Redirect, Stack } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Redirect href="/auth/login" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
