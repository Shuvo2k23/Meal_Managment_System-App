import { db } from "@/firebaseConfig";
import { getAuth } from "firebase/auth";
import { get, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface DepositEntry {
  amount: number;
  date: string;
}

export default function MyDeposits() {
  const [deposits, setDeposits] = useState<DepositEntry[]>([]);

  useEffect(() => {
    const fetchDeposits = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const snapshot = await get(ref(db, `users/${user.uid}/deposites`));
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const filtered: DepositEntry[] = (Object.values(data) as DepositEntry[]).filter((entry: DepositEntry) => {
        const date = new Date(entry.date);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      });

      // Sort by latest first
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setDeposits(filtered);
    };

    fetchDeposits();
  }, []);

  const total = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>
        💰 My Deposits - {new Date().toLocaleString("default", { month: "long" })}
      </Text>

      {deposits.length === 0 ? (
        <Text style={styles.empty}>No deposits this month.</Text>
      ) : (
        deposits.map((d, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.date}>
              {new Date(d.date).toLocaleDateString()}
            </Text>
            <Text style={styles.amount}>৳{d.amount}</Text>
          </View>
        ))
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalText}>Total Deposited: ৳{total}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  date: {
    fontSize: 15,
  },
  amount: {
    fontWeight: "bold",
    color: "#2E7D32",
  },
  totalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    marginTop: 20,
  },
  totalText: {
    textAlign: "right",
    fontSize: 16,
    fontWeight: "bold",
  },
  empty: {
    fontStyle: "italic",
    color: "#666",
    marginTop: 20,
    textAlign: "center",
  },
});
