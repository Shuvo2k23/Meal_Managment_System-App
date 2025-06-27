import { db } from "@/firebaseConfig";
import { onValue, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function TomorrowMenuEditor() {
  const [menu, setMenu] = useState({ breakfast: "", lunch: "", dinner: "" });

  useEffect(() => {
    const menuRef = ref(db, "menu/tomorrow");
    onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setMenu(data);
    });
  }, []);

  const handleSave = () => {

    set(ref(db, "menu/tomorrow"), menu);
  };

  return (
    <View style={styles.box}>
      <Text style={styles.heading}>🍽️ Tomorrow's Menu</Text>
      <TextInput style={styles.input} placeholder="Breakfast" value={menu.breakfast} onChangeText={(v) => setMenu({ ...menu, breakfast: v })} />
      <TextInput style={styles.input} placeholder="Lunch" value={menu.lunch} onChangeText={(v) => setMenu({ ...menu, lunch: v })} />
      <TextInput style={styles.input} placeholder="Dinner" value={menu.dinner} onChangeText={(v) => setMenu({ ...menu, dinner: v })} />
      <Button title="Save Menu" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
});
