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
export default function Details({ moderator }: { moderator?: string }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/login"); // or wherever your login screen is
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

      {/* <Text style={styles.label}>Total Meals</Text>
      <Text style={styles.value}>{userData.totmeals}</Text> */}

      {/* <Text style={styles.label}>Role</Text>
      <Text style={styles.value}>{userData.role}</Text> */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          if (currentUser) {
            router.push({
              pathname: "/screens/editUser",
              params: {
                uid: currentUser.uid,
                moderator: moderator, // Pass admin status if needed
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
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 2,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: "#111",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  editButton: {
    backgroundColor: "#0D9488", // teal
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 30,
    alignSelf: "center",
    elevation: 4,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  logoutButton: {
    backgroundColor: "#DC2626", // red
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
    alignSelf: "center",
    elevation: 4,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
