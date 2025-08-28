import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../components";
import { theme } from "../../theme/theme";
import { Exercise } from "../../types/index";
import { formatRepsValue, formatSetsValue } from "../../utils/formatters";

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <View style={styles.exerciseCardContainer}>
      <AppCard gradient>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseInfo}>
          {formatSetsValue(exercise.targetSets)} Sets x {formatRepsValue(exercise.targetReps)} Reps
          {exercise.targetWeight && ` (${exercise.targetWeight} kg)`}
        </Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCardContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  exerciseName: {
    color: theme.colors.primaryOn,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  exerciseInfo: {
    color: theme.colors.primaryOn,
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.9,
    textAlign: "center",
  },
});
