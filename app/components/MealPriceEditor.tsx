import { auth, db } from "@/firebaseConfig";
import { onValue, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function MealPriceEditor() {
  const [prices, setPrices] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
  });
  const [role, setRole] = useState("");

  useEffect(() => {
    // Load meal prices
    const priceRef = ref(db, "mealPrices");
    onValue(priceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPrices({
          breakfast: String(data.breakfast),
          lunch: String(data.lunch),
          dinner: String(data.dinner),
        });
      }
    });

    // Get current user's role
    const user = auth.currentUser;
    if (user) {
      const roleRef = ref(db, "users/" + user.uid + "/role");
      onValue(roleRef, (snapshot) => {
        const userRole = snapshot.val();
        if (userRole) {
          setRole(userRole);
        }
      });
    }
  }, []);

  const handleSave = () => {
    const parsedPrices = {
      breakfast: Number(prices.breakfast),
      lunch: Number(prices.lunch),
      dinner: Number(prices.dinner),
    };
    set(ref(db, "mealPrices"), parsedPrices);
  };

  return (
    <View style={styles.box}>
      <Text style={styles.heading}>💵 Meal Prices</Text>
      <Text style={styles.label}>🍳 Breakfast Price</Text>
      <TextInput
        style={[styles.input, role === "user" && styles.disabledInput]}
        keyboardType="numeric"
        placeholder="Breakfast Price"
        value={prices.breakfast}
        onChangeText={(v) => setPrices({ ...prices, breakfast: v })}
        editable={role === "admin"}
      />
      <Text style={styles.label}>🍛 Lunch Price</Text>
      <TextInput
        style={[styles.input, role === "user" && styles.disabledInput]}
        keyboardType="numeric"
        placeholder="Lunch Price"
        value={prices.lunch}
        onChangeText={(v) => setPrices({ ...prices, lunch: v })}
        editable={role === "admin"}
      />
      <Text style={styles.label}>🍲 Dinner Price</Text>
      <TextInput
        style={[styles.input, role === "user" && styles.disabledInput]}
        keyboardType="numeric"
        placeholder="Dinner Price"
        value={prices.dinner}
        onChangeText={(v) => setPrices({ ...prices, dinner: v })}
        editable={role === "admin"}
      />

      {role === "admin" && <Button title="Save Prices" onPress={handleSave} />}
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
  label: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  disabledInput: {
    // backgroundColor: "#f0f0f0", // light gray
    // color: "#999",
  },
});
