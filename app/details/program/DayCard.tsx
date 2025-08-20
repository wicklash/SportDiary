import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppCard } from "../../components";
import { theme } from "../../theme/theme";
import { Day } from "../../types/index";

interface DayCardProps {
  day: Day;
  index: number;
  onPress: (day: Day) => void;
  onLongPress: (day: Day) => void;
}

export default function DayCard({ day, index, onPress, onLongPress }: DayCardProps) {
  const totalSets = day.exercises.reduce((total, exercise) => {
    const sets = typeof exercise.targetSets === 'number' ? exercise.targetSets : exercise.targetSets.max;
    return total + sets;
  }, 0);

  return (
    <TouchableOpacity
      style={styles.dayCard}
      onPress={() => onPress(day)}
      onLongPress={() => onLongPress(day)}
      delayLongPress={500}
    >
      <AppCard>
        <View style={styles.dayContent}>
          <View style={styles.dayInfo}>
            <Text style={styles.dayName}>Gün {index + 1}: {day.name}</Text>
            <Text style={styles.dayExerciseCount}>
              {day.exercises.length} egzersiz
              {day.exercises.length > 0 && ` • ${totalSets} set`}
            </Text>
          </View>
          <View style={styles.dayIconContainer}>
            <Ionicons name="fitness" size={24} color={theme.colors.primary} />
            <Ionicons name="chevron-forward" size={20} color={theme.colors.subtext} />
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dayCard: { 
    marginHorizontal: 16, 
    marginBottom: 12,
  },
  dayContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayInfo: {
    flex: 1,
  },
  dayName: { 
    color: theme.colors.text, 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 4 
  },
  dayExerciseCount: { 
    color: theme.colors.subtext, 
    fontSize: 14 
  },
  dayIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
