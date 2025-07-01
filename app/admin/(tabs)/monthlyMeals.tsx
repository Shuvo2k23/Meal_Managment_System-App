import { db } from "@/firebaseConfig";
import { get, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const getCurrentMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const dates: string[] = [];


  for (let d = 2; d <= lastDay + 1; d++) {
    const day = new Date(year, month, d).toISOString().split("T")[0];
    dates.push(day);
  }

  return dates;
};

export default function MonthlyMeals() {
  const [data, setData] = useState<any>(null);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await get(ref(db, "users"));
      if (!snapshot.exists()) return;

      const users = snapshot.val();
      const monthDates = getCurrentMonthDates();

      const result: Record<string, any> = {};

      for (const uid in users) {
        const user = users[uid];
        const mealsByDate = user.meals || {};

        const summary: Record<string, string> = {};

        for (const date of monthDates) {
          const meals = mealsByDate[date] || {};
          summary[date] =
            (meals.breakfast ? "✅" : "❌") +
            (meals.lunch ? "☑️" : "❌") +
            (meals.dinner ? "✅" : "❌");
        }

        result[uid] = {
          name: user.name || uid,
          summary,
        };
      }

      setData(result);
      setDates(monthDates);
    };

    fetchData();
  }, []);

  if (!data)
    return <Text style={{ padding: 20, textAlign: "center" }}>Loading...</Text>;

  return (
    <ScrollView horizontal style={{ flex: 1 }}>
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.row, styles.headerRow]}>
          <View style={[styles.cell, styles.nameCell]}>
            <Text style={styles.headerText}>Name</Text>
          </View>
          {dates.map((date) => (
            <View key={date} style={styles.cell}>
              <Text style={styles.headerText}>{date.slice(8)}</Text>
            </View>
          ))}
        </View>

        {/* Data Rows */}
        {Object.values(data).map((user: any, idx) => (
          <View
            key={idx}
            style={[
              styles.row,
              idx % 2 === 0 ? styles.evenRow : styles.oddRow,
            ]}
          >
            <View style={[styles.cell, styles.nameCell]}>
              <Text style={styles.nameText}>{user.name}</Text>
            </View>
            {dates.map((date) => (
              <View key={date} style={styles.cell}>
                <Text style={styles.cellText}>{user.summary[date]}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 12,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRow: {
    backgroundColor: "#4CAF50",
  },
  evenRow: {
    backgroundColor: "#fafafa",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  cell: {
    minWidth: 70,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  nameCell: {
    minWidth: 200,
    paddingLeft: 10,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    alignItems: "flex-start",
  },
  headerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  nameText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#222",
  },
  cellText: {
    fontSize: 12,
    color: "#444",
  },
});
