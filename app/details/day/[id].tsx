import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { ErrorBanner } from "../../components";
import DetailHeader from "../../components/DetailHeader";
import { showConfirmAlert, showErrorAlert, showSuccessAlert, useCustomAlert } from "../../hooks";
import { StorageService } from "../../services/storage";
import { theme } from "../../theme/theme";
import { Day, Exercise, Program } from "../../types/index";
import { parseRepsValue, parseSetsValue } from "../../utils/parsers";
import ActionButtons from "./ActionButtons";
import AddExerciseModal from "./AddExerciseModal";
import DayStats from "./DayStats";
import ExerciseList from "./ExerciseList";

import EditExerciseModal from "./EditExerciseModal";

export default function DayDetailScreen() {
  const { id, programId } = useLocalSearchParams<{ id: string; programId: string }>();
  const [day, setDay] = useState<Day | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AddExerciseModal state'leri
  const [exerciseName, setExerciseName] = useState("");
  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [exerciseModalLoading, setExerciseModalLoading] = useState(false);

  const loadDayData = useCallback(async () => {
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
  }, [id, programId]);

  useEffect(() => {
    if (id && programId) {
      loadDayData();
    }
  }, [id, programId, loadDayData]);

  // Sayfa her odaklandığında verileri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      if (id && programId) {
        loadDayData();
      }
    }, [id, programId, loadDayData])
  );

  const handleCloseModal = () => {
    setModalVisible(false);
    // Form'u temizle
    setExerciseName("");
    setTargetSets("");
    setTargetReps("");
    setTargetWeight("");
  };

  const handleSubmitExercise = async () => {
    if (!exerciseName.trim() || !targetSets.trim() || !targetReps.trim()) {
      showErrorAlert(showAlert, "Lütfen tüm alanları doldurun");
      return;
    }

    const exerciseData = {
      dayId: id as string,
      name: exerciseName.trim(),
      targetSets: parseSetsValue(targetSets),
      targetReps: parseRepsValue(targetReps),
      targetWeight: targetWeight.trim() ? parseInt(targetWeight) : undefined,
    };

    try {
      setExerciseModalLoading(true);
      
      await StorageService.addExerciseToDay(programId as string, id as string, {
        name: exerciseData.name,
        targetSets: exerciseData.targetSets,
        targetReps: exerciseData.targetReps,
        targetWeight: exerciseData.targetWeight,
        restTime: undefined,
        notes: undefined,
      });
      
      // Başarılı olduğunda form'u temizle ve modal'ı kapat
      setExerciseName("");
      setTargetSets("");
      setTargetReps("");
      setTargetWeight("");
      
      // Modal'ı kapat ve veriyi yenile
      setModalVisible(false);
      await loadDayData();
      showSuccessAlert(showAlert, `"${exerciseData.name}" egzersizi eklendi!`);
    } catch (error) {
      console.error('Egzersiz ekleme hatası:', error);
      showErrorAlert(showAlert, 'Egzersiz eklenirken bir hata oluştu');
    } finally {
      setExerciseModalLoading(false);
    }
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



  const handleEditExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setEditModalVisible(true);
  };



  const handleSaveEditExercise = async (updatedExercise: Exercise) => {
    if (!program || !day) return;

    try {
      setEditModalLoading(true);
      
      await StorageService.updateExercise(program.id, day.id, updatedExercise.id, updatedExercise);
      
      // Gün verilerini yeniden yükle
      await loadDayData();
      
      setEditModalVisible(false);
      setCurrentExercise(null);
      
      showSuccessAlert(showAlert, "Egzersiz başarıyla güncellendi!");
    } catch (error) {
      console.error('Egzersiz güncelleme hatası:', error);
      showErrorAlert(showAlert, "Egzersiz güncellenirken bir hata oluştu");
    } finally {
      setEditModalLoading(false);
    }
  };

  const handleWorkoutDone = async () => {
    if (!program || !day) return;

    if (selectedExercises.size === 0) {
      showErrorAlert(showAlert, 'Lütfen en az bir egzersizi tamamlanmış olarak işaretleyin.');
      return;
    }

    // Seçili egzersizlerin adlarını al
    const selectedExerciseNames = Array.from(selectedExercises)
      .map(exId => day!.exercises.find(ex => ex.id === exId)?.name)
      .filter(Boolean)
      .join(', ');

    showConfirmAlert(
      showAlert,
      "Antrenmanı Tamamla",
      `${selectedExercises.size} egzersizi tamamladınız:\n\n${selectedExerciseNames}\n\nPerformans geçmişine kaydedilsin mi?`,
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
                   notes: exercise.notes || undefined,
                   programName: program?.name,
                   dayName: day?.name,
                 });
              })
            );
          }

          // Seçimi temizle, veriyi yenile
          setSelectedExercises(new Set());
          await loadDayData();
          showSuccessAlert(showAlert, `Antrenman tamamlandı!\n\n${selectedExerciseNames} egzersizleri performans geçmişine eklendi.`);
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
          <Text style={styles.errorText}>Gün bulunamadı</Text>
        </View>
        <AlertComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <DetailHeader title="Day Details" />

      {/* Stats Row */}
      <DayStats 
        exerciseCount={day.exercises.length}
        completedCount={selectedExercises.size}
      />

      {/* Exercises List */}
      <ExerciseList
        day={day}
        programId={program.id}
        selectedExercises={selectedExercises}
        onDelete={handleDeleteExercise}
        onMarkComplete={handleMarkExerciseComplete}
        onEdit={handleEditExercise}
        onPress={handleExercisePress}
      />

      {/* Action Buttons */}
      <ActionButtons
        onAddExercise={() => setModalVisible(true)}
        onWorkoutDone={handleWorkoutDone}
        selectedCount={selectedExercises.size}
      />

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitExercise}
        exerciseName={exerciseName}
        targetSets={targetSets}
        targetReps={targetReps}
        targetWeight={targetWeight}
        loading={exerciseModalLoading}
        onExerciseNameChange={setExerciseName}
        onTargetSetsChange={setTargetSets}
        onTargetRepsChange={setTargetReps}
        onTargetWeightChange={setTargetWeight}
      />



      {/* Edit Exercise Modal */}
      <EditExerciseModal
        visible={editModalVisible}
        exercise={currentExercise}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveEditExercise}
        loading={editModalLoading}
      />

      {/* Error Display */}
      <ErrorBanner 
        error={error}
        onDismiss={() => setError(null)}
      />

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
});
