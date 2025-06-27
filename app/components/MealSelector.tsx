// components/MealSelector.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  selectedMeals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  onToggle: (mealKey: "breakfast" | "lunch" | "dinner") => void;
  disabled?: boolean;
  title?: string;
};

export default function MealSelector({
  selectedMeals,
  onToggle,
  disabled = false,
  title = "✅ Select Your Meals",
}: Props) {
  return (
    <View style={styles.mealSelectionBox}>
      <Text style={styles.heading}>{title}</Text>

      {["breakfast", "lunch", "dinner"].map((mealKey) => (
        <View style={styles.mealRow} key={mealKey}>
          <TouchableOpacity
            style={[
              styles.mealButton,
              selectedMeals[mealKey as keyof typeof selectedMeals] &&
                styles.mealButtonSelected,
              disabled && styles.mealButtonDisabled,
            ]}
            onPress={() => !disabled && onToggle(mealKey as any)}
            disabled={disabled}
          >
            <Text style={styles.mealButtonText}>
              {mealKey === "breakfast"
                ? "🍳 Breakfast"
                : mealKey === "lunch"
                ? "🍛 Lunch"
                : "🍲 Dinner"}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
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
  mealButtonDisabled: {
    opacity: 0.5,
  },
  mealButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
