import { db } from "@/firebaseConfig";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MealCountSummary() {
  const [counts, setCounts] = useState({ breakfast: 0, lunch: 0, dinner: 0 });

  useEffect(() => {

    const countRef = ref(db, "mealCounts");
    onValue(countRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setCounts(data);
    });
  }, []);

  return (
    <View style={styles.box}>
      <Text style={styles.heading}>📊 Meal Count Summary</Text>
      <Text>🍳 Breakfast: {counts.breakfast}</Text>
      <Text>🍛 Lunch: {counts.lunch}</Text>
      <Text>🍲 Dinner: {counts.dinner}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
});
