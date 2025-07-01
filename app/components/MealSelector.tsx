// components/MealSelector.tsx
import { auth, db } from "@/firebaseConfig";
import { get, onValue, ref, set, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MealSelector() {
  const [updatedBalance, setUpdatedBalance] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState("active");
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [prices, setPrices] = useState({ breakfast: 0, lunch: 0, dinner: 0 });

  const fetchMealPrices = async () => {
    const priceRef = ref(db, "mealPrices"); // e.g., { breakfast: 25, lunch: 35, dinner: 30 }
    const snapshot = await get(priceRef);
    if (snapshot.exists()) {
      setPrices(snapshot.val());
    }
  };
  const getMealDate = () => {
    const now = new Date();
    const mealDate = new Date(now);
    if (now.getHours() < 2) {
      mealDate.setDate(now.getDate() - 1);
    }
    return mealDate.toISOString().split("T")[0];
  };
   const adjustBalance = async (amount: number) => {
    const uid = auth.currentUser?.uid;
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, { ...user, balance: updatedBalance });
  };
  const saveMealsToDatabase = async (meals: typeof selectedMeals) => {
    const uid = auth.currentUser?.uid;
    const dateKey = getMealDate();
    const userRef = ref(db, `users/${uid}`);
    const mealRef = ref(db, `users/${uid}/meals/${dateKey}`);

    try {
      // Calculate total expense
      let totalExpense = 0;
      if (meals.breakfast) totalExpense += prices.breakfast || 0;
      if (meals.lunch) totalExpense += prices.lunch || 0;
      if (meals.dinner) totalExpense += prices.dinner || 0;
      // Fetch current balance

      const userSnap = await get(userRef);
      let user = userSnap.exists() ? userSnap.val() : null;
      let currentBalance = user ? user.balance : 0;

      console.log(totalExpense, currentBalance);

      // Get existing meal selection to calculate previous expense
      const prevMealSnap = await get(mealRef);
      const prevMeals = prevMealSnap.exists() ? prevMealSnap.val() : {};
      let prevExpense = 0;
      if (prevMeals.breakfast) prevExpense += prices.breakfast || 0;
      if (prevMeals.lunch) prevExpense += prices.lunch || 0;
      if (prevMeals.dinner) prevExpense += prices.dinner || 0;
      console.log("Previous Expense:", prevExpense);

      const updatedBalance = Number(currentBalance) + Number(prevExpense) - Number(totalExpense);
      setUpdatedBalance(updatedBalance);
      console.log(currentBalance,prevExpense, totalExpense, updatedBalance);
      
      if (updatedBalance <= 0) {
        Alert.alert("Insufficient Balance", "Please recharge your account.");
        return false;
      }
      // Update meal selection with total expense
      await set(mealRef, {
        ...meals,
        totalExpense,
      });
      // Update user balance
      await update(userRef, {balance: updatedBalance });

      return true;
    } catch (error) {
      console.error("Error updating meals and balance:", error);
      return false;
    }
  };
 
  const toggleMeal = (key: "breakfast" | "lunch" | "dinner") => {
    if (status === "blocked") {
      Alert.alert("You are blocked, Contact the Manager for more info");
    } else {
      const updated = { ...selectedMeals, [key]: !selectedMeals[key] };
      saveMealsToDatabase(updated).then(async (success) => {
        if (success) {
          setSelectedMeals(updated);
         
        }
      });
    }
  };

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    fetchMealPrices();
    const userRef = ref(db, "users/" + uid);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUser(data);
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
