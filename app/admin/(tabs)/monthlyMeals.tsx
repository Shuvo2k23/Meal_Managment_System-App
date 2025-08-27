import { db } from "@/firebaseConfig";
import { get, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const { width } = Dimensions.get('window');

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
              (meals.lunch ? "✅" : "❌") +
              (meals.dinner ? "✅" : "❌");
          }

          result[uid] = {
            name: user.name || uid,
            summary,
          };
        }

        setData(result);
        setDates(monthDates);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Loading monthly report...</Text>
      </View>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>No meal data available</Text>
        <Text style={styles.emptySubtext}>
          Check back later for monthly meal reports
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monthly Meals Report</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
        </Text>
      </View>

      <ScrollView 
        horizontal 
        style={styles.horizontalScroll}
        showsHorizontalScrollIndicator={true}
      >
        <View style={styles.table}>
          {/* Fixed Column - Names */}
          <View style={styles.fixedColumn}>
            <View style={[styles.cell, styles.headerCell, styles.nameHeader]}>
              <Text style={styles.headerText}>Name</Text>
            </View>
            {Object.values(data).map((user: any, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.cell, 
                  styles.nameCell,
                  idx % 2 === 0 ? styles.evenRow : styles.oddRow
                ]}
              >
                <Text style={styles.nameText} numberOfLines={1}>
                  {user.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Scrollable Columns - Dates */}
          <ScrollView horizontal>
            <View>
              {/* Date Headers */}
              <View style={styles.dateHeaderRow}>
                {dates.map((date) => (
                  <View key={date} style={[styles.cell, styles.headerCell]}>
                    <Text style={styles.dateText}>
                      {new Date(date).getDate()}
                    </Text>
                    <Text style={styles.dayText}>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Meal Data */}
              {Object.values(data).map((user: any, idx) => (
                <View 
                  key={idx} 
                  style={[
                    styles.row,
                    idx % 2 === 0 ? styles.evenRow : styles.oddRow
                  ]}
                >
                  {dates.map((date) => (
                    <View key={date} style={styles.cell}>
                      <Text style={styles.mealIcons}>
                        {user.summary[date] || "❌❌❌"}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>✅</Text>
          <Text style={styles.legendText}>Meal taken</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>❌</Text>
          <Text style={styles.legendText}>Meal not taken</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8B4513",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8B4513",
    textAlign: "center",
  },
  header: {
    backgroundColor: "#FF8C42", // Orange
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    opacity: 0.9,
  },
  horizontalScroll: {
    flex: 1,
  },
  table: {
    flexDirection: "row",
    minWidth: width,
  },
  fixedColumn: {
    position: "absolute",
    left: 0,
    zIndex: 10,
    backgroundColor: "#FFF8F0",
  },
  dateHeaderRow: {
    flexDirection: "row",
    marginLeft: 120, // Width of the fixed column
  },
  row: {
    flexDirection: "row",
    marginLeft: 120, // Width of the fixed column
  },
  headerCell: {
    backgroundColor: "#8B4513",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
  },
  nameHeader: {
    width: 120,
  },
  cell: {
    width: 80,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0D6C9",
  },
  nameCell: {
    width: 120,
    alignItems: "flex-start",
    paddingLeft: 12,
    backgroundColor: "#FFF",
  },
  evenRow: {
    backgroundColor: "#FFFFFF",
  },
  oddRow: {
    backgroundColor: "#F9F5F0",
  },
  headerText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  nameText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#5A3E2B",
  },
  dateText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  dayText: {
    color: "#FFF",
    fontSize: 10,
    opacity: 0.8,
  },
  mealIcons: {
    fontSize: 16,
    letterSpacing: 2,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#FFF",
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  legendIcon: {
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#5A3E2B",
  },
});