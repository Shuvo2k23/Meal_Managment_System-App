import React from "react";

import { Stack } from "expo-router";
// const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <Stack screenOptions={{
      headerShown:false
  }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="user" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}
