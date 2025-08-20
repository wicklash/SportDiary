import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../theme/theme";
import { Performance } from "../../types";

interface PerformanceItemProps {
  performance: Performance;
  isSelected: boolean;
  selectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onShowNote: (note: string) => void;
  onDelete: (id: string) => void;
}

export default function PerformanceItem({
  performance,
  isSelected,
  selectionMode,
  onPress,
  onLongPress,
  onShowNote,
  onDelete,
}: PerformanceItemProps) {
  return (
    <TouchableOpacity
      style={[
        styles.performanceItem,
        isSelected && styles.selectedPerformanceItem
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <View style={styles.performanceContent}>
        {selectionMode && (
          <View style={styles.selectionIndicator}>
            <Ionicons 
              name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={isSelected ? theme.colors.primary : theme.colors.subtext} 
            />
          </View>
        )}
        <View style={styles.performanceInfo}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceDate}>
              {new Date(performance.date).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </Text>
            <Text style={styles.performanceTime}>
              {new Date(performance.date).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <View style={styles.performanceDetails}>
            <Ionicons name="fitness" size={16} color={theme.colors.primary} />
            <Text style={styles.performanceText}>
              {performance.sets.length} Set x {performance.sets[0]?.reps || 0} Tekrar
              {performance.sets[0]?.weight && ` (${performance.sets[0].weight} kg)`}
            </Text>
          </View>
        </View>
        {!selectionMode && (
          <View style={styles.performanceActions}>
            {performance.notes && (
              <TouchableOpacity
                style={styles.noteButton}
                onPress={() => onShowNote(performance.notes!)}
                activeOpacity={0.7}
              >
                <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.deletePerformanceButton}
              onPress={() => onDelete(performance.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  performanceItem: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedPerformanceItem: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  performanceContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectionIndicator: {
    marginRight: 12,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  performanceDate: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  performanceTime: {
    color: theme.colors.subtext,
    fontSize: 12,
  },
  performanceDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  performanceText: {
    color: theme.colors.text,
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.9,
  },
  performanceActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteButton: {
    padding: 8,
    marginRight: 8,
  },
  deletePerformanceButton: {
    padding: 8,
  },
});
