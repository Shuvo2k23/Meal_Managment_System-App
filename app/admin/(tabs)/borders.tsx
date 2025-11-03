import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from "@/app/constants/theme";
import { db } from "@/firebaseConfig";
import { router } from "expo-router";
import { onValue, ref, remove, set } from "firebase/database";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function Borders() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = () => {
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
      setIsLoading(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchUsers();
    return () => unsubscribe();
  }, []);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter((user: any) => 
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.includes(query) ||
      user.room?.toString().includes(query)
    );
  }, [users, searchQuery]);

  const handleDelete = (uid: any, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
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

  const updateStatus = (uid: string, newStatus: "active" | "blocked", name: string) => {
    const userRef = ref(db, "users/" + uid + "/status");
    
    if (newStatus === "blocked") {
      Alert.alert("Block User?", `Are you sure you want to block ${name}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Block",
          onPress: () => {
            set(userRef, newStatus);
          },
        },
      ]);
    } else {
      set(userRef, newStatus);
    }
  };

  const promoteToAdmin = (uid: string, name: string, currentRole: string) => {
    const userRef = ref(db, "users/" + uid + "/role");
    const newRole = currentRole === "admin" ? "user" : "admin";
    const action = newRole === "admin" ? "promote" : "demote";
    
    Alert.alert(
      `Confirm ${action === "promote" ? "Promotion" : "Demotion"}`,
      `Are you sure you want to ${action} ${name} to ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: `Yes, ${action}`,
          onPress: () => {
            set(userRef, newRole);
          },
        },
      ]
    );
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/screens/editUser",
          params: {
            uid: item.uid,
            moderator: "admin"
          },
        })
      }
      style={[
        styles.userCard,
        item.status === "blocked" && styles.blockedUserCard
      ]}
    >
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.role === "admin" && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          )}
          {item.status === "blocked" && (
            <View style={styles.blockedBadge}>
              <Text style={styles.blockedBadgeText}>BLOCKED</Text>
            </View>
          )}
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📧</Text>
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📞</Text>
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🏠</Text>
          <Text style={styles.detailText}>Room No : {item.room}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>💰</Text>
          <Text style={styles.detailText}>৳ {item.balance || 0}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === "active" && styles.activeStatusButton,
            ]}
            onPress={() => updateStatus(item.uid, "active", item.name)}
          >
            <Text style={[
              styles.statusButtonText,
              item.status === "active" && styles.activeStatusButtonText
            ]}>
              ✅ Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === "blocked" && styles.blockedStatusButton,
            ]}
            onPress={() => updateStatus(item.uid, "blocked", item.name)}
          >
            <Text style={[
              styles.statusButtonText,
              item.status === "blocked" && styles.blockedStatusButtonText
            ]}>
              ⛔ Blocked
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            item.role === "admin" ? styles.demoteButton : styles.promoteButton
          ]}
          onPress={() => promoteToAdmin(item.uid, item.name, item.role)}
        >
          <Text style={styles.roleButtonText}>
            {item.role === "admin" ? "Demote" : "Promote"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.uid, item.name)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>Manage all users in the system</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, phone, or room..."
            placeholderTextColor={COLORS.gray300}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Results Count */}
        {searchQuery.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </Text>
          </View>
        )}
      </View>

      {filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            {searchQuery ? "🔍" : "👥"}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery ? "No users found matching your search" : "No users found"}
          </Text>
          {searchQuery && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
              <Text style={styles.clearSearchButtonText}>Clear Search</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                setIsLoading(true);
                fetchUsers();
              }}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    paddingTop: 50,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZES.huge,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    textAlign: "center",
    opacity: 0.9,
  },

  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.xs,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray200,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  resultsContainer: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  resultsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },

  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: "row",
    ...SHADOWS.medium,
  },
  blockedUserCard: {
    backgroundColor: "#FFF5F5",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.errorLight,
  },
  userInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    flexWrap: "wrap",
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  adminBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  adminBadgeText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  blockedBadge: {
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  blockedBadgeText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: SPACING.sm,
    width: 20,
  },
  detailText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    flexDirection: "row",
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
  },
  activeStatusButton: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  blockedStatusButton: {
    backgroundColor: COLORS.errorLight,
    borderColor: COLORS.error,
  },
  statusButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  activeStatusButtonText: {
    color: COLORS.success,
  },
  blockedStatusButtonText: {
    color: COLORS.error,
  },
  buttonGroup: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: SPACING.sm,
  },
  roleButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 80,
    alignItems: "center",
  },
  promoteButton: {
    backgroundColor: COLORS.info,
  },
  demoteButton: {
    backgroundColor: COLORS.primary,
  },
  roleButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 80,
    alignItems: "center",
  },
  deleteButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  clearSearchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  clearSearchButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});