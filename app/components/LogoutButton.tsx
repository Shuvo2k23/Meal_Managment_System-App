import { auth } from "@/firebaseConfig";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { Alert, Button } from "react-native";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/screens/login"); // Change if your login screen path is different
    } catch (error: any) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  return <Button title="Logout" onPress={handleLogout} />;
}
