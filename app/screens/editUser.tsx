import { db } from "@/firebaseConfig";
import { router, useLocalSearchParams } from "expo-router";
import { onValue, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function EditUser() {
  const { uid,moderator } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(0);
  const [totmeals, setTotmeals] = useState(0);
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("active");
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

    set(ref(db, "users/" + uid), {
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
    style={[
      styles.input,
      moderator === "user" && styles.disabledInput,
    ]}
    value={balance.toString()}
    onChangeText={(v) => setBalance(Number(v))}
    keyboardType="numeric"
    editable={moderator !== "user"}
  />

  <Text style={styles.label}>Total Meals</Text>
  <TextInput
    style={[
      styles.input,
      moderator === "user" && styles.disabledInput,
    ]}
    value={totmeals.toString()}
    onChangeText={(v) => setTotmeals(Number(v))}
    keyboardType="numeric"
    editable={moderator !== "user"}
  />

  <Text style={styles.label}>Role</Text>
  <TextInput
    style={[
      styles.input,
      moderator === "user" && styles.disabledInput,
    ]}
    value={role}
    onChangeText={setRole}
    editable={moderator !== "user"}
  />
  
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
