import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AddExerciseModal from "../../components/AddExerciseModal";
import ExerciseCard from "../../components/ExerciseCard";
import AppButton from "../../components/ui/AppButton";
import StatChip from "../../components/ui/StatChip";
import { StorageService } from "../../services/StorageService";
import { theme } from "../../theme/theme";
import { Day, Program, RepsValue, SetsValue } from "../../types";

export default function DayDetailScreen() {
  const { id, programId } = useLocalSearchParams<{ id: string; programId: string }>();
  const [day, setDay] = useState<Day | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);
  const [exerciseNotes, setExerciseNotes] = useState<{[key: string]: string}>({});
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (id && programId) {
      loadDayData();
    }
  }, [id, programId]);

  const loadDayData = async () => {
    try {
      setLoading(true);
      const programData = await StorageService.getProgram(programId as string);
      const dayData = programData?.days.find(d => d.id === id);
      
      setProgram(programData);
      setDay(dayData || null);
    } catch (error) {
      console.error('Gün verisi yüklenirken hata:', error);
      Alert.alert('Hata', 'Gün verisi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async (exerciseData: {
    name: string;
    targetSets: SetsValue;
    targetReps: RepsValue;
    targetWeight?: number;
  }) => {
    if (!program || !day) return;

    try {
      await StorageService.addExerciseToDay(program.id, day.id, {
        name: exerciseData.name,
        targetSets: exerciseData.targetSets,
        targetReps: exerciseData.targetReps,
        targetWeight: exerciseData.targetWeight,
        restTime: undefined,
        notes: undefined,
      });

      await loadDayData();
      setModalVisible(false);
      Alert.alert("Başarılı", `"${exerciseData.name}" egzersizi eklendi!`);
    } catch (error) {
      console.error('Egzersiz ekleme hatası:', error);
      Alert.alert("Hata", "Egzersiz eklenirken bir hata oluştu");
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!program || !day) return;

    try {
      await StorageService.deleteExercise(program.id, day.id, exerciseId);
      
      // Veriyi yeniden yükle
      await loadDayData();
      
      Alert.alert("Başarılı", "Egzersiz silindi!");
    } catch (error) {
      console.error('Egzersiz silme hatası:', error);
      Alert.alert("Hata", "Egzersiz silinirken bir hata oluştu");
    }
  };

  const handleMarkExerciseComplete = (exerciseId: string) => {
    // Sadece yerel seçim durumunu değiştir; performansı şimdi kaydetme
    setSelectedExercises(prev => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  const handleAddNote = (exerciseId: string) => {
    setCurrentExerciseId(exerciseId);
    setNoteText(exerciseNotes[exerciseId] || "");
    setNoteModalVisible(true);
  };

  const handleSaveNote = () => {
    if (currentExerciseId) {
      setExerciseNotes(prev => ({
        ...prev,
        [currentExerciseId]: noteText.trim()
      }));
    }
    setNoteModalVisible(false);
    setNoteText("");
    setCurrentExerciseId(null);
  };

  const handleCancelNote = () => {
    setNoteModalVisible(false);
    setNoteText("");
    setCurrentExerciseId(null);
  };

  const handleWorkoutDone = async () => {
    if (!program || !day) return;

    try {
      // Seçili egzersizler için performans kaydet (notlarla birlikte)
      const ids = Array.from(selectedExercises);
      if (ids.length > 0) {
        await Promise.all(
          ids.map(exId => StorageService.logExercisePerformance(exId, program.id, day.id, exerciseNotes[exId]))
        );
      }

      // Seçimi ve notları temizle, veriyi yenile
      setSelectedExercises(new Set());
      setExerciseNotes({});
      await loadDayData();
      Alert.alert('Tamamlandı', 'Antrenman tamamlandı. Seçili egzersizler performans geçmişine eklendi.');
    } catch (error) {
      console.error('Antrenman tamamlama hatası:', error);
      Alert.alert('Hata', 'Antrenman tamamlanırken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={64} color="#93b2c8" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!day || !program) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>Gün bulunamadı</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Day</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Stats Row */}
      {day.exercises.length > 0 && (
        <View style={styles.statsRow}>
          <StatChip label={`${day.exercises.length} egzersiz`} />
          <StatChip label={`${selectedExercises.size} tamamlanan`} />
        </View>
      )}

      {/* Exercises List */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {day.exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness" size={80} color="#4A6FA5" />
            <Text style={styles.emptyTitle}>Henüz Egzersiz Yok</Text>
            <Text style={styles.emptyDescription}>
              İlk egzersizinizi eklemek için "Egzersiz Ekle" butonuna tıklayın
            </Text>
          </View>
        ) : (
          day.exercises.map((exercise) => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise}
              programId={program.id}
              dayId={day.id}
              onDelete={handleDeleteExercise}
              onMarkComplete={handleMarkExerciseComplete}
              onAddNote={handleAddNote}
              isCompleted={selectedExercises.has(exercise.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Add Exercise Button */}
      <View style={styles.buttonContainer}>
        <AppButton title="Egzersiz Ekle" onPress={() => setModalVisible(true)} />
        <AppButton title="Workout Done" onPress={handleWorkoutDone} variant="secondary" style={{ marginTop: 12 }} />
      </View>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onAddExercise={handleAddExercise}
      />

      {/* Note Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={noteModalVisible}
        onRequestClose={handleCancelNote}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Egzersiz Notu</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCancelNote}
              >
                <Ionicons name="close" size={24} color="#93b2c8" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Bu egzersiz için notlarınız..."
                placeholderTextColor="#93b2c8"
                value={noteText}
                onChangeText={setNoteText}
                multiline={true}
                numberOfLines={4}
                maxLength={300}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelNote}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleSaveNote}
              >
                <Text style={styles.createButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 12,
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
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  buttonIcon: {
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
    marginTop: 16,
    marginBottom: 32,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  form: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: theme.colors.subtext,
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: theme.colors.primaryOn,
    fontSize: 16,
    fontWeight: "600",
  },

});