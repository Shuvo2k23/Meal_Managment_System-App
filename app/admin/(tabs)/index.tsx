
import MealCountSummary from "@/app/components/MealCountSummary";
import MealPriceEditor from "@/app/components/MealPriceEditor";
import NoticePublisher from "@/app/components/NoticePublisher";
import TomorrowMenuEditor from "@/app/components/TomorrowMenuEditor";
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
const [selectedMeals, setSelectedMeals] = useState({
  breakfast: false,
  lunch: false,
  dinner: false,
});

type Meals = { breakfast: boolean; lunch: boolean; dinner: boolean };

const toggleMeal = (key: "breakfast" | "lunch" | "dinner") => {
  setSelectedMeals((prev: Meals) => ({ ...prev, [key]: !prev[key] }));
};

export default function Index() {
  return (
    <ScrollView style={styles.container}>
      <TomorrowMenuEditor />


      <MealCountSummary />
      <NoticePublisher />
      <MealPriceEditor />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    flex: 1,
  },
});
