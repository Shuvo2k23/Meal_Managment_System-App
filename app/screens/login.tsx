import { auth, db } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { router } from "expo-router";
import { get, ref } from "firebase/database";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
       const snapshot = await get(ref(db, "users/" + user.uid));
      if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log("User Data:", userData);

      // Assuming userData contains a `role` field like "user" or "admin"
      if (userData.role === "user") {
        router.replace("/user/(tabs)"); // Navigate to user home
      } else if (userData.role === "admin") {
        router.replace("/admin/(tabs)"); // Navigate to admin home
      } else {
        Alert.alert("Login Failed", "Unknown user role.");
      }

    } else {
      Alert.alert("Login Failed", "User data not found.");
    }

    } catch (error :any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} />
      

      <Text style={styles.link} onPress={() => router.replace("/screens/signup")}>
        Do not have an account? Sign Up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 },
  link: { marginTop: 15, color: "blue", textAlign: "center" },
});
