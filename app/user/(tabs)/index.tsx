import MealPriceEditor from "@/app/components/MealPriceEditor";
import MealSelector from "@/app/components/MealSelector";
import MenuBox from "@/app/components/MenuBox";
import { db } from "@/firebaseConfig";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [notice, setNotice] = useState("");
  const [showNotice, setShowNotice] = useState(false);
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Fetch notice
    const noticeRef = ref(db, "notice");
    onValue(noticeRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.published) {
        setNotice(data.text);
        setShowNotice(true);

        // Animate notice appearance
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        setShowNotice(false);
      }
    });
  }, []);

  const toggleNoticeExpansion = () => {
    setIsNoticeExpanded(!isNoticeExpanded);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Manager</Text>
        <Text style={styles.headerSubtitle}>User Dashboard</Text>
      </View>

      {/* Menu Box */}
      <View style={styles.section}>
        <MenuBox />
      </View>

      <MealSelector />

      {/* Notice */}
      {showNotice && (
        <Animated.View style={[styles.noticeBox, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={toggleNoticeExpansion} activeOpacity={0.7}>
            <View style={styles.noticeHeader}>
              <Text style={styles.noticeIcon}>📢</Text>
              <Text style={styles.noticeHeading}>Important Notice</Text>
              <Text style={styles.expandIcon}>
                {isNoticeExpanded ? "▲" : "▼"}
              </Text>
            </View>
            {(isNoticeExpanded || notice.length < 150) && (
              <Text style={styles.noticeText}>{notice}</Text>
            )}
            {notice.length >= 150 && !isNoticeExpanded && (
              <Text style={styles.noticePreview}>
                {notice.substring(0, 150)}...
                <Text style={styles.readMore}>Read more</Text>
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
      <MealPriceEditor role="user" />
    </ScrollView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0", // Off-white/cream background
    paddingBottom: 20,
  },
  header: {
    backgroundColor: "#FF8C42", // Orange
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    opacity: 0.9,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513", // Brown
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E6D6",
  },
  noticeBox: {
    backgroundColor: "#FFF9E9",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFE3B8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFE3B8",
  },
  noticeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  noticeHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513", // Brown
    flex: 1,
  },
  expandIcon: {
    fontSize: 14,
    color: "#8B4513", // Brown
  },
  noticeText: {
    padding: 16,
    color: "#5A3E2B",
    lineHeight: 20,
  },
  noticePreview: {
    padding: 16,
    color: "#5A3E2B",
    lineHeight: 20,
  },
  readMore: {
    color: "#FF8C42", // Orange
    fontWeight: "500",
  },
});
