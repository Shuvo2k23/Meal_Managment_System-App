import { auth, db } from "@/firebaseConfig";
import { get, onValue, ref, runTransaction } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MealSelector() {
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState("active");
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [prices, setPrices] = useState({ breakfast: 0, lunch: 0, dinner: 0 });

  const getMealDate = () => {
    const now = new Date();
    const mealDate = new Date(now);
    if (now.getHours() < 2) {
      mealDate.setDate(now.getDate() - 1);
    }
    return mealDate.toISOString().split("T")[0];
  };

  const fetchMealPrices = async () => {
    const priceRef = ref(db, "mealPrices");
    const snapshot = await get(priceRef);
    if (snapshot.exists()) {
      setPrices(snapshot.val());
    }
  };

  const saveMealsToDatabase = async (meals: typeof selectedMeals) => {
    const uid = auth.currentUser?.uid;
    const dateKey = getMealDate();
    const userRef = ref(db, `users/${uid}`);

    try {
      const result = await runTransaction(userRef, (userData: any) => {
        if (!userData) return;

        const currentBalance = userData.balance || 0;
        const prevMeals = userData.meals?.[dateKey] || {};

        let prevExpense = 0;
        if (prevMeals.breakfast) prevExpense += prices.breakfast || 0;
        if (prevMeals.lunch) prevExpense += prices.lunch || 0;
        if (prevMeals.dinner) prevExpense += prices.dinner || 0;

        let totalExpense = 0;
        if (meals.breakfast) totalExpense += prices.breakfast || 0;
        if (meals.lunch) totalExpense += prices.lunch || 0;
        if (meals.dinner) totalExpense += prices.dinner || 0;

        const updatedBalance = currentBalance + prevExpense - totalExpense;

        if (updatedBalance < 0) {
          Alert.alert("Insufficient Balance", "Please recharge your account.");
          return; // Cancel transaction
        }

        // Atomic update of balance and meals
        userData.balance = updatedBalance;
        userData.meals = {
          ...(userData.meals || {}),
          [dateKey]: {
            ...meals,
            totalExpense,
          },
        };

        return userData;
      });

      return result.committed;
    } catch (error) {
      console.error("Transaction error:", error);
      return false;
    }
  };

  const toggleMeal = (key: "breakfast" | "lunch" | "dinner") => {
    if (status === "blocked") {
      Alert.alert("You are blocked, Contact the Manager for more info");
      return;
    }

    const updated = { ...selectedMeals, [key]: !selectedMeals[key] };
    saveMealsToDatabase(updated).then((success) => {
      if (success) {
        setSelectedMeals(updated);
      }
    });
  };

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    fetchMealPrices();

    const userRef = ref(db, "users/" + uid);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUser(data);
      setStatus(data?.status || "active");
    });

    const mealRef = ref(db, `users/${uid}/meals/${getMealDate()}`);
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
