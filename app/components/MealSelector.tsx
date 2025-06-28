// components/MealSelector.tsx
import { auth, db } from "@/firebaseConfig";
import { onValue, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MealSelector() {
  const [status, setStatus] = useState("active");
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  const getMealDate = () => {
    const now = new Date();
    const mealDate = new Date(now);
    if (now.getHours() < 2) {
      mealDate.setDate(now.getDate() - 1);
    }
    return mealDate.toISOString().split("T")[0];
  };

  const saveMealsToDatabase = async (meals: typeof selectedMeals) => {
    const user = auth.currentUser;
    if (!user) return;

    const dateKey = getMealDate();
    const mealRef = ref(db, `users/${user.uid}/meals/${dateKey}`);
    await set(mealRef, meals);
  };

  const toggleMeal = (key: "breakfast" | "lunch" | "dinner") => {
    const now = new Date();
    const currentHour = now.getHours();

    if (status === "blocked") {
      Alert.alert("You are blocked", "Contact the Manager for more info.");
      return;
    }

    if (currentHour >= 0 && currentHour < 3) {
      Alert.alert(
        "Meal selection is closed",
        "You can't update meals after 12 AM. Please try again after 6 AM."
      );
      return;
    }

    setSelectedMeals((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      saveMealsToDatabase(updated); // Save immediately
      return updated;
    });
  };

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userRef = ref(db, "users/" + uid);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatus(data.status || "active");
      }
    });

    const dateKey = getMealDate();
    const mealRef = ref(db, `users/${uid}/meals/${dateKey}`);
    onValue(mealRef, (snapshot) => {
      const mealData = snapshot.val();
      if (mealData) {
        setSelectedMeals({
          breakfast: !!mealData.breakfast,
          lunch: !!mealData.lunch,
          dinner: !!mealData.dinner,
        });
      }
    });
  }, []);

  return (
    <View style={styles.mealSelectionBox}>
      <Text style={styles.heading}>✅ Select Your Meals</Text>

      <View style={styles.mealRow}>
        <TouchableOpacity
          style={[
            styles.mealButton,
            selectedMeals.breakfast && styles.mealButtonSelected,
          ]}
          onPress={() => toggleMeal("breakfast")}
        >
          <Text style={styles.mealButtonText}>🍳 Breakfast</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mealRow}>
        <TouchableOpacity
          style={[
            styles.mealButton,
            selectedMeals.lunch && styles.mealButtonSelected,
          ]}
          onPress={() => toggleMeal("lunch")}
        >
          <Text style={styles.mealButtonText}>🍛 Lunch</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mealRow}>
        <TouchableOpacity
          style={[
            styles.mealButton,
            selectedMeals.dinner && styles.mealButtonSelected,
          ]}
          onPress={() => toggleMeal("dinner")}
        >
          <Text style={styles.mealButtonText}>🍲 Dinner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mealSelectionBox: {
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
  mealRow: {
    marginBottom: 10,
  },
  mealButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  mealButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  mealButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
