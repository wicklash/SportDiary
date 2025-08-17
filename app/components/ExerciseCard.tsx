import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { showConfirmAlert, useCustomAlert } from "../hooks/useCustomAlert";
import { ExerciseStorage } from "../services/storage";
import { theme } from "../theme/theme";
import { Exercise } from "../types";
import { formatRepsValue, formatSetsValue } from "../utils/formatters";
import AppCard from "./ui/AppCard";
import SwipeableRow from "./ui/SwipeableRow";

interface ExerciseCardProps {
  exercise: Exercise;
  programId?: string;
  dayId?: string;
  onDelete?: (exerciseId: string) => void;
  onMarkComplete?: (exerciseId: string) => void;
  onAddNote?: (exerciseId: string) => void;
  onPress?: (exerciseId: string) => void;
  isCompleted?: boolean;
  onRefresh?: () => void;
}

export default function ExerciseCard({ 
  exercise, 
  programId, 
  dayId, 
  onDelete, 
  onMarkComplete, 
  onAddNote, 
  onPress, 
  isCompleted,
  onRefresh
}: ExerciseCardProps) {
  const completed = Boolean(isCompleted);
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLongPress = () => {
    showConfirmAlert(
      showAlert,
      "Egzersizi Sil",
      `"${exercise.name}" egzersizini silmek istediğinize emin misiniz?`,
      () => handleDeleteExercise(exercise.id)
    );
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!programId || !dayId) {
      Alert.alert('Hata', 'Program veya gün bilgisi bulunamadı');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await ExerciseStorage.deleteExercise(programId, dayId, exerciseId);

      Alert.alert(
        'Başarılı',
        'Egzersiz başarıyla silindi.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              onDelete?.(exerciseId);
              onRefresh?.();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Egzersiz silme hatası:', error);
      setError('Egzersiz silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(exercise.id);
    } else {
      // Fallback: console log if no onPress handler provided
      console.log('Egzersiz detayları:', {
        exerciseId: exercise.id,
        dayId,
        programId,
        exerciseName: exercise.name
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
    <SwipeableRow onDelete={() => handleDeleteExercise(exercise.id)}>
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
      
      {/* Custom Alert */}
      <AlertComponent />
      
      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
            <Text style={styles.retryButtonText}>Hata Mesajını Temizle</Text>
          </TouchableOpacity>
        </View>
      )}
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
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
  errorContainer: {
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  retryButtonText: {
    color: theme.colors.primaryOn,
    fontSize: 16,
    fontWeight: 'bold',
  },
});