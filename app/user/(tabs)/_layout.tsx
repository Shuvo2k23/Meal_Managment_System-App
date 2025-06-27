import { Tabs } from "expo-router";

export default function _layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Dashboard" }}
      />
      {/* Uncomment these if you want to add more tabs */}
      
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
    </Tabs>
  )
}