import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Exercise, formatSetsValue, formatRepsValue } from "../types";

interface ExerciseCardProps {
  exercise: Exercise;
  programId?: string;
  dayId?: string;
  onDelete?: (exerciseId: string) => void;
  onMarkComplete?: (exerciseId: string) => void;
}

export default function ExerciseCard({ exercise, programId, dayId, onDelete, onMarkComplete }: ExerciseCardProps) {
  const handleLongPress = () => {
    Alert.alert(
      "Egzersizi Sil",
      `"${exercise.name}" egzersizini silmek istediğinize emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => onDelete?.(exercise.id)
        }
      ]
    );
  };

  const handlePress = () => {
    if (programId && dayId) {
      router.push({
        pathname: "/pages/exercise-details/[id]",
        params: {
          id: exercise.id,
          dayId: dayId,
          programId: programId,
        }
      });
    }
  };

  const handleMarkComplete = (e: any) => {
    e.stopPropagation(); // Prevent card press when button is pressed
    if (onMarkComplete) {
      onMarkComplete(exercise.id);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={800}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#2E86AB', '#A23B72']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.exerciseContent}>
          <View style={styles.leftSection}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseTarget}>
              {formatSetsValue(exercise.targetSets)} Sets x {formatRepsValue(exercise.targetReps)} Reps
            </Text>
            {exercise.targetWeight && (
              <Text style={styles.exerciseWeight}>
                {exercise.targetWeight} kg
              </Text>
            )}
          </View>
          <View style={styles.rightSection}>
            <TouchableOpacity 
              style={styles.checkButton}
              onPress={handleMarkComplete}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle" size={28} color="#34C759" />
            </TouchableOpacity>
            {exercise.lastPerformance && (
              <Text style={styles.lastPerformanceText}>
                Last: {exercise.lastPerformance.sets.length} Sets x{' '}
                {exercise.lastPerformance.sets[0]?.reps || 0} Reps{' '}
                {exercise.lastPerformance.sets[0]?.weight ? 
                  `(${exercise.lastPerformance.sets[0].weight} kg)` : ''}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  gradientBackground: {
    padding: 10,
    minHeight: 70,
  },
  exerciseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 20,
    minWidth: 120,
  },
  checkButton: {
    padding: 4,
    marginBottom: 4,
  },
  exerciseName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 1,
    letterSpacing: 0.3,
  },
  exerciseTarget: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.95,
    letterSpacing: 0.2,
  },
  exerciseWeight: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.85,
    marginTop: 1,
  },
  lastPerformanceText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.85,
    textAlign: 'right',
    lineHeight: 16,
  },
});