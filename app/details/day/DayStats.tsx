import React from "react";
import { StyleSheet, View } from "react-native";
import StatChip from "./StatChip";

interface DayStatsProps {
  exerciseCount: number;
  completedCount: number;
}

export default function DayStats({ exerciseCount, completedCount }: DayStatsProps) {
  if (exerciseCount === 0) return null;

  return (
    <View style={styles.statsRow}>
      <StatChip label={`${exerciseCount} egzersiz`} />
      <StatChip label={`${completedCount} tamamlanan`} />
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 12,
  },
});
