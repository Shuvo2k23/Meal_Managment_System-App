import { db } from "@/firebaseConfig";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MenuBox() {
  const [menu, setMenu] = useState({ breakfast: "", lunch: "", dinner: "" });
  useEffect(() => {
    // Fetch tomorrow's menu
    const menuRef = ref(db, "menu/tomorrow");
    onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setMenu(data);
    });
  }, []);
  return (
    <View style={styles.menuBox}>
      <Text style={styles.heading}>🍽️ Tomorrow's Menu</Text>
      <Text>🥚 Breakfast: {menu.breakfast || "N/A"}</Text>
      <Text>🍛 Lunch: {menu.lunch || "N/A"}</Text>
      <Text>🍲 Dinner: {menu.dinner || "N/A"}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  menuBox: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
