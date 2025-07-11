import { db } from "@/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import { get, ref, runTransaction } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function DepositComponent() {
  const [users, setUsers] = useState<{ uid: string; name: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await get(ref(db, "users"));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data).map(([uid, value]: any) => ({
          uid,
          name: value.name,
        }));
        setUsers(list);
      }
    };

    fetchUsers();
  }, []);

  const handleDeposit = async () => {
    if (!selectedUser || !amount) {
      Alert.alert("Error", "Please select a user and enter amount");
      return;
    }
    const depositAmount = Number(amount);
    setLoading(true);
    const userRef = ref(db, `users/${selectedUser}`);
    const depositTimestamp = Date.now(); // Use for log key
    const depositDate = new Date().toISOString();

    try {
      await runTransaction(userRef, (userData: any) => {
        if (!userData) return;

        const currentBalance = userData.balance || 0;
        const newBalance = currentBalance + depositAmount;

        // Update balance
        userData.balance = newBalance;

        // Add deposit log entry
        userData.deposites = {
          ...(userData.deposites || {}),
          [depositTimestamp]: {
            amount: depositAmount,
            date: depositDate,
          },
        };

        return userData;
      });

      Alert.alert("Success", `৳${depositAmount} deposited successfully.`);
      setAmount("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Border:</Text>
      <View style={styles.dropdownWrapper}>
        <View style={styles.dropdown}>
          <Picker
            selectedValue={selectedUser}
            onValueChange={(itemValue) => setSelectedUser(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="-- Select User --" value="" />
            {users.map((user) => (
              <Picker.Item key={user.uid} label={user.name} value={user.uid} />
            ))}
          </Picker>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter amount (৳)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholderTextColor="#666"
      />

      <Button title="Deposit" onPress={handleDeposit} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 6,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 10,
  },
  picker: {
    height: 50,
    borderBottomWidth: 1,
    borderColor: "#eee",
    color:"black"
  },
});
