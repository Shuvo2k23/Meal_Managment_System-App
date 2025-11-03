import { auth, db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { get, ref } from "firebase/database";
import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations on component mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
        const checkAuth = async () => {
          const user = auth.currentUser;
          if (user) {
            // User is signed in, check role and navigate
            try {
              const snapshot = await get(ref(db, "users/" + user.uid));
              if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.role === "admin") {
                  // Check stored preference for admin
                  const storedMode = await AsyncStorage.getItem('adminLoginMode');
                  if (storedMode === 'user') {
                    router.replace("/user/(tabs)");
                  } else if (storedMode === 'admin') {
                    // Default to admin if no preference or preference is admin
                    router.replace("/admin/(tabs)");
                  }
                } else {
                  router.replace("/user/(tabs)");
                }
              } else {
                // No user data, sign out and go to login
                await auth.signOut();
                router.replace("/auth/login");
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
              await auth.signOut();
              router.replace("/auth/login");
            }
          } else {
            // No user signed in, go to login
            router.replace("/auth/login");
          }
        };

        checkAuth();
      
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Meal Manager</Text>
        <Text style={styles.subtitle}>Simplify Your Meal Planning</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("@/assets/images/food.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.message,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.redirectText}>Redirecting...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF8C42",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#8B4513",
    textAlign: "center",
  },
  imageContainer: {
    width: 300,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  message: {
    alignItems: "center",
    marginTop: 20,
  },
  redirectText: {
    fontSize: 16,
    color: "#8B4513",
    fontStyle: "italic",
  },
});