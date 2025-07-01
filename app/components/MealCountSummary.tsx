import { db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { get, ref } from "firebase/database";
import React, { useEffect, useState } from "react";

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function MealCountSummary() {
  const [counts, setCounts] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [prices, setPrices] = useState({ breakfast: 0, lunch: 0, dinner: 0 });

  const usersRef = ref(db, "users");

  const getMealDate = () => {
    const now = new Date();
    if (now.getHours() < 2) {
      now.setDate(now.getDate() - 1);
    }
    return now.toISOString().split("T")[0];
  };
  const mealDate = getMealDate();
  const fetchMealCounts = async () => {
    const snapshot = await get(usersRef);
    let breakfast = 0;
    let lunch = 0;
    let dinner = 0;

    if (snapshot.exists()) {
      const users = snapshot.val();
      for (const uid in users) {
        const meals = users[uid]?.meals?.[mealDate];
        if (meals) {
          if (meals.breakfast) breakfast++;
          if (meals.lunch) lunch++;
          if (meals.dinner) dinner++;
        }
      }
    }
    setCounts({ breakfast, lunch, dinner });
  };

  const fetchMealPrices = async () => {
    const priceRef = ref(db, "mealPrices"); // e.g., { breakfast: 25, lunch: 35, dinner: 30 }
    const snapshot = await get(priceRef);
    if (snapshot.exists()) {
      setPrices(snapshot.val());
    }
  };

  useEffect(() => {
    fetchMealCounts();
    fetchMealPrices();
  }, []);

  const totalBreakfastCost = counts.breakfast * prices.breakfast;
  const totalLunchCost = counts.lunch * prices.lunch;
  const totalDinnerCost = counts.dinner * prices.dinner;
  const grandTotal = totalBreakfastCost + totalLunchCost + totalDinnerCost;

  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <Text style={styles.heading}>📊 Meal Count Summary</Text>
        <TouchableOpacity
          onPress={() => {
            fetchMealCounts();
            fetchMealPrices();
          }}
        >
          <Ionicons name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <Text>
        🍳 Breakfast: {counts.breakfast} × ৳{prices.breakfast} = ৳
        {totalBreakfastCost}
      </Text>
      <Text>
        🍛 Lunch: {counts.lunch} × ৳{prices.lunch} = ৳{totalLunchCost}
      </Text>
      <Text>
        🍲 Dinner: {counts.dinner} × ৳{prices.dinner} = ৳{totalDinnerCost}
      </Text>

      <View style={styles.totalBox}>
        <Text style={styles.totalText}>💰 Total Cost: ৳{grandTotal}</Text>

      </View>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalBox: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#4CAF50",
  },
});
