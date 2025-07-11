import { db } from "@/firebaseConfig";
import { router, useLocalSearchParams } from "expo-router";
import { onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function EditUser() {
  const { uid, moderator } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(0);
  const [totmeals, setTotmeals] = useState(0);
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("active");

  const validateInputs = () => {
    if (!name.trim()) return "Name is required.";
    if (!room.trim() || isNaN(Number(room)))
      return "Valid Room No is required.";
    if (!phone.match(/^\d{11}$/)) return "Phone number must be 11 digits.";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Invalid email format.";
    return null;
  };

  useEffect(() => {
    const userRef = ref(db, "users/" + uid);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setName(data.name || "");
        setRoom(data.room || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setBalance(data.balance || 0);
        setTotmeals(data.totmeals || 0);
        setRole(data.role || "user");
        setStatus(data.status || "active");
      }
    });
  }, [uid]);

  const handleUpdate = () => {
    const errorMessage = validateInputs();
    if (errorMessage) {
      Alert.alert("Validation Error", errorMessage);
      return;
    }
    update(ref(db, "users/" + uid), {
      name,
      room,
      phone,
      email,
      balance,
      totmeals,
      role,
      status,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Room</Text>
      <TextInput style={styles.input} value={room} onChangeText={setRoom} />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Balance</Text>
      <TextInput
        style={styles.input}
        value={balance.toString()}
        onChangeText={(v) => setBalance(Number(v))}
        keyboardType="numeric" 
        editable={false}
      />
      {moderator === "admin" ? (
        <View>
          <Text style={styles.label}>Role</Text>
          <TextInput style={styles.input} value={role} onChangeText={setRole} />
        </View>
      ) : (
        <Text> </Text>
      )}
      <Button title="Update User" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 5,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0", // light gray
    color: "#999",
  },
});
