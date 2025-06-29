import { db } from "@/firebaseConfig";
import { router } from "expo-router";
import { onValue, ref, remove, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Borders() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(db, "users/");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const userList = data
        ? Object.entries(data).map(([uid, user]) => ({
            uid,
            ...(user as object),
          }))
        : [];
      setUsers(userList as any);
      //   console.log("Users data:", userList);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (uid: any) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            remove(ref(db, "users/" + uid));
          },
        },
      ]
    );
  };
  const updateStatus = (uid: string, newStatus: "active" | "blocked") => {
    const userRef = ref(db, "users/" + uid + "/status");
    // Optional: confirm if switching to blocked
    if (newStatus === "blocked") {
      Alert.alert("Block User?", "Are you sure you want to block this user?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            set(userRef, newStatus);
          },
        },
      ]);
    } else {
      set(userRef, newStatus);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.userText}>👤 {item.name}</Text>
        <Text>📧 {item.email}</Text>
        <Text>📞 {item.phone}</Text>
        <Text>🏠 Room: {item.room}</Text>
        <Text>💰 Balance: {item.balance}</Text>
        {/* <Text>🍽️ Meals: {item.totmeals}</Text> */}
        {/* <Text>🔑 Role: {item.role}</Text> */}
        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === "active" && styles.selectedStatus,
            ]}
            onPress={() => updateStatus(item.uid, "active")}
          >
            <Text style={styles.statusText}>✅ Active</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === "blocked" && styles.selectedStatus,
            ]}
            onPress={() => updateStatus(item.uid, "blocked")}
          >
            <Text style={styles.statusText}>⛔ Blocked</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/screens/editUser",
              params: { uid: item.uid,
                moderator:"admin" // Pass admin status if needed
               },
            })
          }
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.uid)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No users found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 3,
  },
  userText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonGroup: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    padding: 6,
    borderRadius: 4,
  },
  btnText: {
    color: "#fff",
  },
  statusContainer: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
    flexWrap: "wrap",
  },
  statusButton: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
  },
  selectedStatus: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  statusText: {
    color: "#000",
    fontWeight: "bold",
  },
});
