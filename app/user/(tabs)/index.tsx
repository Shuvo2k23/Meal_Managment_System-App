import MealPriceEditor from "@/app/components/MealPriceEditor";
import MealSelector from "@/app/components/MealSelector";
import { db } from "@/firebaseConfig";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [menu, setMenu] = useState({ breakfast: "", lunch: "", dinner: "" });
  const [notice, setNotice] = useState("");
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Fetch tomorrow's menu
    const menuRef = ref(db, "menu/tomorrow");
    onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setMenu(data);
    });

    // Fetch notice
    const noticeRef = ref(db, "notice");
    onValue(noticeRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.published) {
        setNotice(data.text);
        setShowNotice(true);
      } else {
        setShowNotice(false);
      }
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Menu Box */}
      <View style={styles.menuBox}>
        <Text style={styles.heading}>🍽️ Tomorrow's Menu</Text>
        <Text>🥚 Breakfast: {menu.breakfast || "N/A"}</Text>
        <Text>🍛 Lunch: {menu.lunch || "N/A"}</Text>
        <Text>🍲 Dinner: {menu.dinner || "N/A"}</Text>
      </View>

      {/* Meal Selection */}
      <MealSelector />

      {/* Notice */}
      {showNotice && (
        <View style={styles.noticeBox}>
          <Text style={styles.heading}>📢 Notice</Text>
          <Text>{notice}</Text>
        </View>
      )}
      <MealPriceEditor />
    </ScrollView>
  );
}

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  menuBox: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
  },
  noticeBox: {
    backgroundColor: "#FFF9C4",
    padding: 16,
    borderRadius: 10,
    elevation: 3,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
});
