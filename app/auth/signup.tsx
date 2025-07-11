import { auth, db } from "@/firebaseConfig";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useState } from "react";
import {
  Alert,
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateInputs = () => {
    if (!name.trim()) return "Name is required.";
    if (!room.trim() || isNaN(Number(room)))
      return "Valid Room No is required.";
    if (!phone.match(/^\d{11}$/)) return "Phone number must be 11 digits.";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Invalid email format.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSignup = async () => {
    const errorMessage = validateInputs();
    if (errorMessage) {
      Alert.alert("Validation Error", errorMessage);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await set(ref(db, "users/" + user.uid), {
        name,
        room,
        phone,
        email,
        balance: 0,
        totmeals: 0,
        role: "user",
        status: "active",
      });
      Alert.alert("Success", "Account created!");
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Signup</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <Text style={styles.label}>Room No</Text>
          <TextInput
            placeholder="Enter your room number"
            placeholderTextColor="#888"
            value={room}
            onChangeText={setRoom}
            style={styles.input}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Phone No</Text>
          <TextInput
            placeholder="Enter your phone number"
            placeholderTextColor="#888"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={11}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            placeholder="Re-type your password"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry
          />

          <Button title="Signup" onPress={handleSignup} />

          <Text
            style={styles.link}
            onPress={() => router.replace("/auth/login")}
          >
            Already have an account? Login
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop:100
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },
  link: {
    marginTop: 16,
    color: "#007bff",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});