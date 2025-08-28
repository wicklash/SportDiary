import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme/theme";
import { Day, Exercise } from "../../types/index";
import ExerciseCard from "./ExerciseCard";

interface ExerciseListProps {
  day: Day;
  programId: string;
  selectedExercises: Set<string>;
  onDelete: (exerciseId: string) => void;
  onMarkComplete: (exerciseId: string) => void;
  onEdit: (exercise: Exercise) => void;
  onPress: (exerciseId: string) => void;
}

export default function ExerciseList({
  day,
  programId,
  selectedExercises,
  onDelete,
  onMarkComplete,
  onEdit,
  onPress,
}: ExerciseListProps) {
  if (day.exercises.length === 0) {
    return (
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.emptyState}>
          <Ionicons name="fitness" size={80} color={theme.colors.primary} />
          <Text style={styles.emptyTitle}>Henüz Egzersiz Yok</Text>
                      <Text style={styles.emptyDescription}>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              İlk egzersizinizi eklemek için "Egzersiz Ekle" butonuna tıklayın
            </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {day.exercises.map((exercise) => (
        <ExerciseCard 
          key={exercise.id} 
          exercise={exercise}
          programId={programId}
          dayId={day.id}
          onDelete={onDelete}
          onMarkComplete={onMarkComplete}
          onEdit={onEdit}
          onPress={onPress}
          isCompleted={selectedExercises.has(exercise.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
    minHeight: 400,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    color: theme.colors.subtext,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.8,
  },
});
