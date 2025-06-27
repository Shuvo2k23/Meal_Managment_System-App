import { auth, db } from "@/firebaseConfig";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [menu, setMenu] = useState({ breakfast: "", lunch: "", dinner: "" });
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState("active"); // default is active
  const [showNotice, setShowNotice] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  useEffect(() => {
    // Fetch tomorrow's menu
    const menuRef = ref(db, "menu/tomorrow");
    onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setMenu(data);
    });

    // Fetch notice
    const noticeRef = ref(db, "notice");
    onValue(noticeRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.published) {
        setNotice(data.text);
        setShowNotice(true);
      } else {
        setShowNotice(false);
      }
    });
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userRef = ref(db, "users/" + uid);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatus(data.status || "active");
      }
    });
  }, []);

  const toggleMeal = (key: "breakfast" | "lunch" | "dinner") => {
    if (status === "blocked") {
      Alert.alert("You are blocked, Contact to Manager for more info");
    } else {
      setSelectedMeals((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Menu Box */}
      <View style={styles.menuBox}>
        <Text style={styles.heading}>🍽️ Tomorrow's Menu</Text>
        <Text>🥚 Breakfast: {menu.breakfast || "N/A"}</Text>
        <Text>🍛 Lunch: {menu.lunch || "N/A"}</Text>
        <Text>🍲 Dinner: {menu.dinner || "N/A"}</Text>
      </View>

      {/* Meal Selection */}
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

      {/* Notice */}
      {showNotice && (
        <View style={styles.noticeBox}>
          <Text style={styles.heading}>📢 Notice</Text>
          <Text>{notice}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  menuBox: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
  },
  mealSelectionBox: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
  },
  noticeBox: {
    backgroundColor: "#FFF9C4",
    padding: 16,
    borderRadius: 10,
    elevation: 3,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
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
    backgroundColor: "#4CAF50", // green when selected
  },

  mealButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
