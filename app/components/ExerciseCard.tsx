import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme/theme";
import { Exercise, formatRepsValue, formatSetsValue } from "../types";
import AppCard from "./ui/AppCard";
import SwipeableRow from "./ui/SwipeableRow";

interface ExerciseCardProps {
  exercise: Exercise;
  programId?: string;
  dayId?: string;
  onDelete?: (exerciseId: string) => void;
  onMarkComplete?: (exerciseId: string) => void;
  onAddNote?: (exerciseId: string) => void;
  isCompleted?: boolean;
}

export default function ExerciseCard({ exercise, programId, dayId, onDelete, onMarkComplete, onAddNote, isCompleted }: ExerciseCardProps) {
  const completed = Boolean(isCompleted);
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

  const handleAddNote = (e: any) => {
    e.stopPropagation(); // Prevent card press when button is pressed
    if (onAddNote) {
      onAddNote(exercise.id);
    }
  };

  return (
    <SwipeableRow onDelete={() => onDelete?.(exercise.id)}>
      <TouchableOpacity
        style={styles.wrapper}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={800}
        activeOpacity={0.9}
      >
        <AppCard>
          <View style={styles.exerciseContent}>
            <View style={styles.leftSection}>
              <Text style={styles.exerciseName} numberOfLines={1} ellipsizeMode="tail">{exercise.name}</Text>
              <Text style={styles.exerciseTarget} numberOfLines={1} ellipsizeMode="tail">
                {formatSetsValue(exercise.targetSets)} Sets x {formatRepsValue(exercise.targetReps)} Reps
              </Text>
              <Text style={styles.exerciseWeight} numberOfLines={1} ellipsizeMode="tail">
                {exercise.targetWeight != null ? `${exercise.targetWeight} kg` : '-'}
              </Text>
            </View>
            <View style={styles.rightSection}>
              <TouchableOpacity style={styles.checkButton} onPress={handleMarkComplete} activeOpacity={0.7}>
                <Ionicons
                  name={completed ? "checkmark-circle" : "ellipse-outline"}
                  size={28}
                  color={completed ? theme.colors.success : theme.colors.subtext}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.noteButton} onPress={handleAddNote} activeOpacity={0.7}>
                <Ionicons name="create-outline" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 12,
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
    marginLeft: 16,
    minWidth: 110,
  },
  checkButton: {
    padding: 6,
    marginBottom: 6,
  },
  noteButton: {
    padding: 6,
    marginTop: 2,
  },
  exerciseName: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  exerciseTarget: {
    color: theme.colors.subtext,
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseWeight: {
    color: theme.colors.subtext,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  
});