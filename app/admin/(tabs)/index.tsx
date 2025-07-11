
import DepositComponent from "@/app/components/Deposite";
import MealCountSummary from "@/app/components/MealCountSummary";
import MealPriceEditor from "@/app/components/MealPriceEditor";
import MealSelector from "@/app/components/MealSelector";
import NoticePublisher from "@/app/components/NoticePublisher";
import TomorrowMenuEditor from "@/app/components/TomorrowMenuEditor";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";


export default function Index() {

  return (
    <ScrollView style={styles.container}>
      <TomorrowMenuEditor />
      <MealSelector/>
      <MealCountSummary />
      <DepositComponent/>
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
