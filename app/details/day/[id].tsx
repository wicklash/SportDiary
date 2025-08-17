import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AddExerciseModal, AppButton, ExerciseCard, StatChip } from "../../components";
import { showConfirmAlert, showErrorAlert, showSuccessAlert, useCustomAlert } from "../../hooks";
import { StorageService } from "../../services/storage";
import { theme } from "../../theme/theme";
import { Day, Program, RepsValue, SetsValue } from "../../types";

export default function DayDetailScreen() {
  const { id, programId } = useLocalSearchParams<{ id: string; programId: string }>();
  const [day, setDay] = useState<Day | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);
  const [exerciseNotes, setExerciseNotes] = useState<{[key: string]: string}>({});
  const [noteText, setNoteText] = useState("");
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && programId) {
      loadDayData();
    }
  }, [id, programId]);

  // Sayfa her odaklandığında verileri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      if (id && programId) {
        loadDayData();
      }
    }, [id, programId])
  );

  const loadDayData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const programData = await StorageService.getProgram(programId as string);
      if (programData) {
        const dayData = programData.days.find(d => d.id === id);
        setProgram(programData);
        setDay(dayData || null);
      }
    } catch (error) {
      console.error('Gün verisi yüklenirken hata:', error);
      setError('Gün verisi yüklenirken bir hata oluştu');
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
      setLoading(true);
      setError(null);
      
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
      showSuccessAlert(showAlert, `"${exerciseData.name}" egzersizi eklendi!`);
    } catch (error) {
      console.error('Egzersiz ekleme hatası:', error);
      setError('Egzersiz eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!program || !day) return;

    const exerciseName = day.exercises.find(ex => ex.id === exerciseId)?.name || 'Bu egzersiz';
    
    showConfirmAlert(
      showAlert,
      "Egzersizi Sil",
      `"${exerciseName}" egzersizini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      async () => {
        try {
          setLoading(true);
          setError(null);
          
          await StorageService.deleteExercise(program.id, day.id, exerciseId);
          
          await loadDayData();
          showSuccessAlert(showAlert, "Egzersiz silindi!");
        } catch (error) {
          console.error('Egzersiz silme hatası:', error);
          setError('Egzersiz silinirken bir hata oluştu');
        } finally {
          setLoading(false);
        }
      }
    );
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

    if (selectedExercises.size === 0) {
      showErrorAlert(showAlert, 'Lütfen en az bir egzersizi tamamlanmış olarak işaretleyin.');
      return;
    }

    showConfirmAlert(
      showAlert,
      "Antrenmanı Tamamla",
      `${selectedExercises.size} egzersizi tamamladınız. Performans geçmişine kaydedilsin mi?`,
      async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Seçili egzersizler için performans kaydet (notlarla birlikte)
          const ids = Array.from(selectedExercises);
          if (ids.length > 0) {
            await Promise.all(
              ids.map(exId => {
                // İlgili egzersizi bul
                const exercise = day!.exercises.find(ex => ex.id === exId);
                if (!exercise) return Promise.resolve();

                // Target sets/reps'e göre performans setleri oluştur
                const targetSets = typeof exercise.targetSets === 'number' 
                  ? exercise.targetSets 
                  : exercise.targetSets.min;
                const targetReps = typeof exercise.targetReps === 'number' 
                  ? exercise.targetReps 
                  : exercise.targetReps.min;

                const performanceSets = Array.from({ length: targetSets }, (_, index) => ({
                  setNumber: index + 1,
                  reps: targetReps,
                  weight: exercise.targetWeight || undefined,
                  completed: true
                }));

                return StorageService.savePerformance({
                  exerciseName: exercise.name, // exerciseId yerine exerciseName kullan
                  date: new Date().toISOString(),
                  sets: performanceSets,
                  notes: exerciseNotes[exId] || undefined,
                  programName: program?.name,
                  dayName: day?.name,
                });
              })
            );
          }

          // Seçimi ve notları temizle, veriyi yenile
          setSelectedExercises(new Set());
          setExerciseNotes({});
          await loadDayData();
          showSuccessAlert(showAlert, 'Antrenman tamamlandı! Seçili egzersizler performans geçmişine eklendi.');
        } catch (error) {
          console.error('Antrenman tamamlama hatası:', error);
          setError('Antrenman tamamlanırken bir hata oluştu');
        } finally {
          setLoading(false);
        }
      },
      "Kaydet", // Buton metni
      "default" // Buton stili
    );
  };

  const handleExercisePress = (exerciseId: string) => {
    if (program?.id && day?.id) {
      router.push(`/details/exercise/${exerciseId}?programId=${program.id}&dayId=${day.id}` as any);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={64} color={theme.colors.subtext} />
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
          <Ionicons name="alert-circle" size={64} color={theme.colors.danger} />
          <Text style={styles.errorText}>Gün bulunamadı</Text>
          <TouchableOpacity 
            style={styles.errorBackButton}
            onPress={() => router.back()}
          >
            <Text style={styles.errorBackButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
        <AlertComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Day Details</Text>
        <View style={{ width: 24 }} />
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
            <Ionicons name="fitness" size={80} color={theme.colors.primary} />
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
              onPress={handleExercisePress}
              isCompleted={selectedExercises.has(exercise.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <AppButton title="Egzersiz Ekle" onPress={() => setModalVisible(true)} />
        {selectedExercises.size > 0 && (
          <AppButton 
            title={`Workout Done (${selectedExercises.size})`} 
            onPress={handleWorkoutDone} 
            variant="secondary" 
            style={{ marginTop: 12 }} 
          />
        )}
      </View>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={modalVisible}
        onClose={handleCloseModal}
        programId={programId}
        dayId={id}
        onExerciseAdded={() => loadDayData()}
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
                <Ionicons name="close" size={24} color={theme.colors.subtext} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Bu egzersiz için notlarınız..."
                placeholderTextColor={theme.colors.subtext}
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

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)} style={styles.errorBannerButton}>
            <Ionicons name="close" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Alert */}
      <AlertComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: theme.colors.text,
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
    color: theme.colors.text,
    fontSize: 18,
    marginTop: 16,
    marginBottom: 32,
    textAlign: "center",
  },
  errorBackButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorBackButtonText: {
    color: theme.colors.primaryOn,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
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
    backgroundColor: theme.colors.background,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  // Error Banner Styles
  errorBanner: {
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  errorBannerButton: {
    padding: 4,
    marginLeft: 8,
  },
});
