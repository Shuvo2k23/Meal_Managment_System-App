import { auth, db } from "@/firebaseConfig";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
type UserData = {
  name: string;
  email: string;
  phone: string;
  room: string;
  balance: number;
  totmeals: number;
  role: string;
};
export default function Details() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/screens/login"); // or wherever your login screen is
    } catch (error: any) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  const [userData, setUserData] = useState<UserData | null>(null);
  const currentUser = auth.currentUser;
  useEffect(() => {
    if (!currentUser) return;

    const userRef = ref(db, "users/" + currentUser.uid);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
    });

    return () => unsubscribe();
  }, []);

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>

      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{userData.name}</Text>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{userData.email}</Text>

      <Text style={styles.label}>Phone</Text>
      <Text style={styles.value}>{userData.phone}</Text>

      <Text style={styles.label}>Room</Text>
      <Text style={styles.value}>{userData.room}</Text>

      <Text style={styles.label}>Balance</Text>
      <Text style={styles.value}>৳ {userData.balance}</Text>

      <Text style={styles.label}>Total Meals</Text>
      <Text style={styles.value}>{userData.totmeals}</Text>

      <Text style={styles.label}>Role</Text>
      <Text style={styles.value}>{userData.role}</Text>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          if (currentUser) {
            router.push({
              pathname: "/screens/editUser",
              params: { uid: currentUser.uid,
                   moderator: "admin" // Pass admin status if needed
               },
            });
          } else {
            Alert.alert("Error", "User not found.");
          }
        }}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: "#4CAF50", // green
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
    elevation: 3, // for Android shadow
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  logoutButton: {
    backgroundColor: "#F44336", // red
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    alignSelf: "center",
    elevation: 3, // for Android shadow
  },
    logoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
});
