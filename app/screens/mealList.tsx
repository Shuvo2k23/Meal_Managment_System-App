import { db } from "@/firebaseConfig";
import { getAuth } from "firebase/auth";
import { get, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const getCurrentMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const dates: string[] = [];

  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    const day = new Date(year, month, d).toISOString().split("T")[0];
    dates.push(day);
  }
  return dates;
};

export default function MyMeals() {
  const [meals, setMeals] = useState<Record<string, any>>({});
  const [prices, setPrices] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const dates = getCurrentMonthDates();

  useEffect(() => {
    const fetchData = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const mealRef = ref(db, `users/${user.uid}/meals`);
      const snapshot = await get(mealRef);
      if (snapshot.exists()) {
        setMeals(snapshot.val());
      }

      const priceRef = ref(db, "mealPrices");
      const priceSnap = await get(priceRef);
      if (priceSnap.exists()) {
        setPrices(priceSnap.val());
      }
    };

    fetchData();
  }, []);

  const getDailyCost = (meal: any) => {
    let total = 0;
    if (meal?.breakfast) total += Number(prices.breakfast);
    if (meal?.lunch) total += Number(prices.lunch);
    if (meal?.dinner) total += Number(prices.dinner);
    return total;
  };

  const totalCost = dates.reduce((sum, date) => {
    const meal = meals?.[date];
    return sum + getDailyCost(meal);
  }, 0);

  return (
    <ScrollView style={{ padding: 10 }}>
      <Text style={styles.heading}>
        🍽️ My Meals - {new Date().toLocaleString("default", { month: "long" })}
      </Text>
      {dates.map((date) => {
        const meal = meals?.[date] || {};
        const cost = getDailyCost(meal);
        return (
          <View key={date} style={styles.row}>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.meal}>🍳 {meal.breakfast ? "✅" : "❌"}</Text>
            <Text style={styles.meal}>🍛 {meal.lunch ? "✅" : "❌"}</Text>
            <Text style={styles.meal}>🍲 {meal.dinner ? "✅" : "❌"}</Text>
            <Text style={styles.cost}>৳{cost}</Text>
          </View>
        );
      })}
      <View style={styles.totalRow}>
        <Text style={styles.totalText}>💰 Total Cost: ৳{totalCost}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 4,
  },
  date: {
    width: 100,
    fontWeight: "bold",
  },
  meal: {
    width: 60,
    textAlign: "center",
  },
  cost: {
    marginLeft: "auto",
    fontWeight: "bold",
  },
  totalRow: {
    margin: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
});
