import { db } from "@/firebaseConfig";
import { onValue, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function TomorrowMenuEditor() {
  const [menu, setMenu] = useState({ breakfast: "", lunch: "", dinner: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const menuRef = ref(db, "menu/tomorrow");
    onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setMenu(data);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await set(ref(db, "menu/tomorrow"), menu);
      setSaved(true);
      // Reset saved status after 2 seconds
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving menu:", error);
    } finally {
      setLoading(false);
    }
  };

  interface MealInputProps {
    icon: string;
    mealType: "breakfast" | "lunch" | "dinner";
    value: string;
    placeholder: string;
  }

  const MealInput: React.FC<MealInputProps> = ({ icon, mealType, value, placeholder }) => (
    <View style={styles.mealContainer}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealIcon}>{icon}</Text>
        <Text style={styles.mealLabel}>
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={(v) => setMenu({ ...menu, [mealType]: v })}
        multiline
        numberOfLines={2}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tomorrow's Menu</Text>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <MealInput
          icon="🍳"
          mealType="breakfast"
          value={menu.breakfast}
          placeholder="Enter breakfast menu items..."
        />
        
        <MealInput
          icon="🍛"
          mealType="lunch"
          value={menu.lunch}
          placeholder="Enter lunch menu items..."
        />
        
        <MealInput
          icon="🍲"
          mealType="dinner"
          value={menu.dinner}
          placeholder="Enter dinner menu items..."
        />

        <TouchableOpacity
          style={[styles.saveButton, saved && styles.saveButtonSuccess]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.saveButtonText}>
                {saved ? "Menu Saved!" : "Update Menu"}
              </Text>
              {saved && <Text style={styles.successIcon}>✓</Text>}
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    maxHeight: 500,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FF8C42",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  adminBadge: {
    backgroundColor: "#6c757d",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  content: {
    padding: 16,
  },
  mealContainer: {
    marginBottom: 20,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  mealIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  mealLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: "#fff",
    minHeight: 60,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#0d6efd",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonSuccess: {
    backgroundColor: "#198754",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  successIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});