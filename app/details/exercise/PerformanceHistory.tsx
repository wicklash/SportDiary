import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../theme/theme";
import { Performance } from "../../types";
import PerformanceItem from "./PerformanceItem";

interface PerformanceHistoryProps {
  performanceHistory: Performance[];
  showAllHistory: boolean;
  selectionMode: boolean;
  selectedPerformances: Set<string>;
  onShowAllHistoryToggle: () => void;
  onPerformancePress: (id: string) => void;
  onPerformanceLongPress: (id: string) => void;
  onShowNote: (note: string) => void;
  onDeletePerformance: (id: string) => void;
}

export default function PerformanceHistory({
  performanceHistory,
  showAllHistory,
  selectionMode,
  selectedPerformances,
  onShowAllHistoryToggle,
  onPerformancePress,
  onPerformanceLongPress,
  onShowNote,
  onDeletePerformance,
}: PerformanceHistoryProps) {
  if (performanceHistory.length === 0) {
    return (
      <View style={styles.emptyPerformance}>
        <Ionicons name="bar-chart" size={64} color={theme.colors.subtext} />
        <Text style={styles.emptyPerformanceTitle}>Henüz Performans Kaydı Yok</Text>
        <Text style={styles.emptyPerformanceDesc}>
          Bu egzersiz için henüz antrenman kaydı bulunmuyor
        </Text>
      </View>
    );
  }

  const displayedPerformances = showAllHistory ? performanceHistory : performanceHistory.slice(0, 5);

  return (
    <View style={styles.infoContainer}>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Performans Geçmişi ({performanceHistory.length})</Text>
        {displayedPerformances.map((performance) => (
          <PerformanceItem
            key={performance.id}
            performance={performance}
            isSelected={selectedPerformances.has(performance.id)}
            selectionMode={selectionMode}
            onPress={() => onPerformancePress(performance.id)}
            onLongPress={() => onPerformanceLongPress(performance.id)}
            onShowNote={onShowNote}
            onDelete={onDeletePerformance}
          />
        ))}
        {performanceHistory.length > 5 && (
          <TouchableOpacity onPress={onShowAllHistoryToggle}>
            <Text style={styles.moreText}>
              {showAllHistory
                ? 'Daha az göster'
                : `+${performanceHistory.length - 5} daha fazla kayıt`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyPerformance: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyPerformanceTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyPerformanceDesc: {
    color: theme.colors.subtext,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  moreText: {
    color: theme.colors.subtext,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});
