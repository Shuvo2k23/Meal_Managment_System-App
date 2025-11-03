import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from "@/app/constants/theme";
import { db } from "@/firebaseConfig";
import { get, ref, set } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DAYS = [
  { id: "sat", label: "Saturday", short: "SAT" },
  { id: "sun", label: "Sunday", short: "SUN" },
  { id: "mon", label: "Monday", short: "MON" },
  { id: "tue", label: "Tuesday", short: "TUE" },
  { id: "wed", label: "Wednesday", short: "WED" },
  { id: "thu", label: "Thursday", short: "THU" },
  { id: "fri", label: "Friday", short: "FRI" },
];

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
] as const;

type MealSet = {
  breakfast: string;
  lunch: string;
  dinner: string;
};

export default function MenuEditor() {
  const [meals, setMeals] = useState<Record<string, MealSet>>(() =>
    DAYS.reduce((acc, d) => {
      acc[d.id] = { breakfast: "", lunch: "", dinner: "" };
      return acc;
    }, {} as Record<string, MealSet>)
  );

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateMealField = useCallback(
    (dayId: string, field: keyof MealSet, value: string) => {
      setMeals((prev) => ({
        ...prev,
        [dayId]: {
          ...prev[dayId],
          [field]: value,
        },
      }));
    },
    []
  );

  useEffect(() => {
    const menuRef = ref(db, "/menu/weekly");
    const fetchMenu = async () => {
      try {
        const snapshot = await get(menuRef);
        if (!snapshot.exists()) return;

        const data = snapshot.val();
        let entries: any[] = [];
        
        if (Array.isArray(data)) {
          entries = data;
        } else if (data && typeof data === "object") {
          entries = Object.entries(data).map(([k, v]: any) => ({
            day: k,
            ...(v || {}),
          }));
        }

        setMeals((prev) => {
          const next = { ...prev };
          entries.forEach((e: any) => {
            const dayId = (e.day || "").toString().toLowerCase();
            if (!dayId || !next[dayId]) return;
            next[dayId] = {
              breakfast: e.breakfast || "",
              lunch: e.lunch || "",
              dinner: e.dinner || "",
            };
          });
          return next;
        });
      } catch (err) {
        console.error("Failed to load weekly menu:", err);
      }
    };

    fetchMenu();
  }, []);

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      const payload = DAYS.map((d) => ({ day: d.id, ...meals[d.id] }));
      await set(ref(db, "/menu/weekly"), payload);
      Alert.alert("Success", "Weekly menu saved successfully!", [
        { text: "OK", style: "default" }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save menu. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [meals]);

  const openDayModal = (dayId: string) => {
    setSelectedDay(dayId);
    setModalVisible(true);
  };

  const closeDayModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedDay(null), 300);
  };

  const getCompletionStatus = (dayId: string) => {
    const dayMeals = meals[dayId];
    const filled = [dayMeals.breakfast, dayMeals.lunch, dayMeals.dinner].filter(Boolean).length;
    return { filled, total: 3 };
  };

  const selectedDayData = selectedDay ? DAYS.find(d => d.id === selectedDay) : null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Weekly Menu Editor</Text>
          <Text style={styles.headerSubtitle}>
            Manage meal plans for the week
          </Text>
        </View>

        <View style={styles.content}>
          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {DAYS.map((day) => {
              const status = getCompletionStatus(day.id);
              const isComplete = status.filled === status.total;
              const isPartial = status.filled > 0 && status.filled < status.total;

              return (
                <TouchableOpacity
                  key={day.id}
                  style={styles.dayCard}
                  onPress={() => openDayModal(day.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dayCardHeader}>
                    <Text style={styles.dayShort}>{day.short}</Text>
                    <View style={[
                      styles.statusIndicator,
                      isComplete && styles.statusComplete,
                      isPartial && styles.statusPartial,
                    ]} />
                  </View>
                  <Text style={styles.dayLabel}>{day.label}</Text>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { width: `${(status.filled / status.total) * 100}%` }
                    ]} />
                  </View>
                  <Text style={styles.statusText}>
                    {status.filled} of {status.total} meals
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={saveAll}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.textLight} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save All Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Day Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDayModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={styles.modalBackdrop} onPress={closeDayModal} />
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedDayData?.label}</Text>
                <Text style={styles.modalSubtitle}>Edit meal plans</Text>
              </View>
              <TouchableOpacity onPress={closeDayModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedDay && MEAL_TYPES.map((meal) => (
                <View key={meal.key} style={styles.mealSection}>
                  <View style={styles.mealLabelContainer}>
                    <Text style={styles.mealLabel}>{meal.label}</Text>
                    {meals[selectedDay][meal.key] && (
                      <View style={styles.filledBadge}>
                        <Text style={styles.filledBadgeText}>Filled</Text>
                      </View>
                    )}
                  </View>
                  <TextInput
                    style={styles.input}
                    multiline
                    numberOfLines={4}
                    value={meals[selectedDay][meal.key]}
                    onChangeText={(t) => updateMealField(selectedDay, meal.key, t)}
                    placeholder={`Enter ${meal.label.toLowerCase()} menu items...`}
                    placeholderTextColor={COLORS.gray300}
                  />
                </View>
              ))}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={closeDayModal}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalDoneButton} 
                onPress={closeDayModal}
              >
                <Text style={styles.modalDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    backgroundColor: "#FF8C42",
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
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

  // Content
  content: {
    padding: SPACING.lg,
  },

  // Days Grid
  daysGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  dayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  dayCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  dayShort: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray200,
  },
  statusComplete: {
    backgroundColor: COLORS.success,
  },
  statusPartial: {
    backgroundColor: COLORS.warning,
  },
  dayLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },

  // Save Button
  saveButton: {
    backgroundColor: COLORS.textPrimary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  infoIconContainer: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.info,
    justifyContent: "center",
    alignItems: "center",
  },
  infoIconText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "90%",
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  modalBody: {
    padding: SPACING.lg,
    maxHeight: 500,
  },
  mealSection: {
    marginBottom: SPACING.lg,
  },
  mealLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  mealLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  filledBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  filledBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.success,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZES.md,
    backgroundColor: COLORS.surface,
    minHeight: 50,
    textAlignVertical: "top",
    color: COLORS.textPrimary,
  },
  modalFooter: {
    flexDirection: "row",
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  modalCancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  modalDoneButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  modalDoneButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textLight,
  },
});