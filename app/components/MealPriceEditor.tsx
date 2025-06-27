import { db } from "@/firebaseConfig";
import { onValue, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function MealPriceEditor() {
  const [prices, setPrices] = useState({ breakfast: "", lunch: "", dinner: "" });

  useEffect(() => {
    const refP = ref(db, "mealPrices");
    onValue(refP, (snapshot) => {
      const data = snapshot.val();
      if (data) setPrices(data);
    });
  }, []);

  const handleSave = () => {
    set(ref(db, "mealPrices"), prices);
  };

  return (
    <View style={styles.box}>
      <Text style={styles.heading}>💵 Meal Prices</Text>
      <TextInput style={styles.input} keyboardType="numeric" placeholder="Breakfast Price" value={prices.breakfast} onChangeText={(v) => setPrices({ ...prices, breakfast: v })} />
      <TextInput style={styles.input} keyboardType="numeric" placeholder="Lunch Price" value={prices.lunch} onChangeText={(v) => setPrices({ ...prices, lunch: v })} />
      <TextInput style={styles.input} keyboardType="numeric" placeholder="Dinner Price" value={prices.dinner} onChangeText={(v) => setPrices({ ...prices, dinner: v })} />
      <Button title="Save Prices" onPress={handleSave} />
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
});
