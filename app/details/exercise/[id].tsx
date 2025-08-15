import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AppButton, AppCard } from "../../components";
import { showConfirmAlert, showErrorAlert, showSuccessAlert, useCustomAlert } from "../../hooks/useCustomAlert";
import { PerformanceStorage, StorageService } from "../../services/storage";
import { theme } from "../../theme/theme";
import { Day, Exercise, Performance, Program } from "../../types";
import { formatRepsValue, formatSetsValue } from "../../utils/formatters";
import { parseRepsValue, parseSetsValue } from "../../utils/parsers";

export default function ExerciseDetailScreen() {
  const { id, dayId, programId } = useLocalSearchParams<{ 
    id: string; 
    dayId: string; 
    programId: string; 
  }>();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [day, setDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<Performance[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPerformances, setSelectedPerformances] = useState<Set<string>>(new Set());
  const { showAlert, AlertComponent } = useCustomAlert();

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editTargetSets, setEditTargetSets] = useState("");
  const [editTargetReps, setEditTargetReps] = useState("");
  const [editTargetWeight, setEditTargetWeight] = useState("");

  // İlk yükleme
  useEffect(() => {
    if (id && dayId && programId) {
      loadExerciseData();
    }
  }, [id, dayId, programId]);

  // Sadece performans geçmişini güncelle (performance eklendiğinde/silindiğinde)
  useFocusEffect(
    useCallback(() => {
      if (exercise) {
        loadPerformanceHistory();
      }
    }, [exercise?.id])
  );

  const loadExerciseData = async () => {
    try {
      setLoading(true);
      const programData = await StorageService.getProgram(programId as string);
      const dayData = programData?.days.find(d => d.id === dayId);
      const exerciseData = dayData?.exercises.find(e => e.id === id);
      
      setProgram(programData);
      setDay(dayData || null);
      setExercise(exerciseData || null);
      
      // Set edit form values
      if (exerciseData) {
        setEditName(exerciseData.name);
        setEditTargetSets(formatSetsValue(exerciseData.targetSets));
        setEditTargetReps(formatRepsValue(exerciseData.targetReps));
        setEditTargetWeight(exerciseData.targetWeight?.toString() || "");
      }

      // Performans geçmişini yükle
      if (exerciseData) {
        const history = await PerformanceStorage.getExercisePerformances(exerciseData.id);
        setPerformanceHistory(history);
      }
    } catch (error) {
      console.error('Egzersiz verisi yüklenirken hata:', error);
      showErrorAlert(showAlert, 'Egzersiz verisi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sadece performans geçmişini yükle (hafif işlem)
  const loadPerformanceHistory = async () => {
    if (exercise) {
      try {
        const history = await PerformanceStorage.getExercisePerformances(exercise.id);
        setPerformanceHistory(history);
      } catch (error) {
        console.error('Performans geçmişi yüklenirken hata:', error);
      }
    }
  };

  const handleDeletePerformance = async (performanceId: string) => {
    showConfirmAlert(
      showAlert,
      "Performans Kaydını Sil",
      "Bu performans kaydını silmek istediğinize emin misiniz?",
      async () => {
        try {
          await PerformanceStorage.deletePerformance(performanceId);
          // Sadece performans listesini güncelle
          await loadPerformanceHistory();
          showSuccessAlert(showAlert, "Performans kaydı silindi!");
        } catch (error) {
          console.error('Performans silme hatası:', error);
          showErrorAlert(showAlert, "Performans kaydı silinirken bir hata oluştu");
        }
      }
    );
  };

  const handleShowNote = (note: string) => {
    setSelectedNote(note);
    setNoteModalVisible(true);
  };

  const handleCloseNoteModal = () => {
    setNoteModalVisible(false);
    setSelectedNote("");
  };

  const handleLongPress = (performanceId: string) => {
    setSelectionMode(true);
    setSelectedPerformances(new Set([performanceId]));
  };

  const handlePerformancePress = (performanceId: string) => {
    if (selectionMode) {
      setSelectedPerformances(prev => {
        const next = new Set(prev);
        if (next.has(performanceId)) {
          next.delete(performanceId);
        } else {
          next.add(performanceId);
        }
        
        // Seçim kalmadıysa seçim modundan çık
        if (next.size === 0) {
          setSelectionMode(false);
        }
        
        return next;
      });
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedPerformances(new Set());
  };

  const handleDeleteSelected = async () => {
    const count = selectedPerformances.size;
    showConfirmAlert(
      showAlert,
      "Seçili Kayıtları Sil",
      `${count} performans kaydını silmek istediğinize emin misiniz?`,
      async () => {
        try {
          const idsToDelete = Array.from(selectedPerformances);
          
          // Seri olarak sil
          for (const id of idsToDelete) {
            await PerformanceStorage.deletePerformance(id);
          }
          
          // Sadece performans listesini güncelle
          await loadPerformanceHistory();
          
          // Seçim modundan çık
          setSelectionMode(false);
          setSelectedPerformances(new Set());
          showSuccessAlert(showAlert, `${count} performans kaydı silindi!`);
        } catch (error) {
          console.error('Toplu silme hatası:', error);
          showErrorAlert(showAlert, "Performans kayıtları silinirken bir hata oluştu");
        }
      }
    );
  };

  const handleSaveChanges = async () => {
    if (!exercise || !program || !day) return;

    if (!editName.trim()) {
      showErrorAlert(showAlert, "Lütfen egzersiz adını girin");
      return;
    }

    try {
      const updatedExercise = {
        ...exercise,
        name: editName.trim(),
        targetSets: parseSetsValue(editTargetSets),
        targetReps: parseRepsValue(editTargetReps),
        targetWeight: editTargetWeight ? parseInt(editTargetWeight) : undefined,
      };

      // Mevcut StorageService.updateExercise kullanarak güncelle
      await StorageService.updateExercise(program.id, day.id, exercise.id, updatedExercise);
      
      setExercise(updatedExercise);
      setEditing(false);
      
      showSuccessAlert(showAlert, "Egzersiz bilgileri güncellendi!");
    } catch (error) {
      console.error('Egzersiz güncelleme hatası:', error);
      showErrorAlert(showAlert, "Egzersiz güncellenirken bir hata oluştu");
    }
  };

  const handleDeleteExercise = async () => {
    if (!exercise || !program || !day) return;

    showConfirmAlert(
      showAlert,
      "Egzersizi Sil",
      `"${exercise.name}" egzersizini silmek istediğinize emin misiniz?`,
      async () => {
        try {
          await StorageService.deleteExercise(program.id, day.id, exercise.id);
          showSuccessAlert(showAlert, "Egzersiz silindi!");
          router.back();
        } catch (error) {
          console.error('Egzersiz silme hatası:', error);
          showErrorAlert(showAlert, "Egzersiz silinirken bir hata oluştu");
        }
      }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={64} color={theme.colors.subtext} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
        <AlertComponent />
      </SafeAreaView>
    );
  }

  if (!exercise || !program || !day) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.danger} />
          <Text style={styles.errorText}>Egzersiz bulunamadı</Text>
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        {selectionMode ? (
          <>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleCancelSelection}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedPerformances.size} seçili
            </Text>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleDeleteSelected}
              disabled={selectedPerformances.size === 0}
            >
              <Ionicons 
                name="trash" 
                size={24} 
                color={selectedPerformances.size > 0 ? theme.colors.danger : theme.colors.subtext} 
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Exercise Details</Text>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setEditing(!editing)}
            >
              <Ionicons 
                name={editing ? "close" : "create"} 
                size={24} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Exercise Card */}
      <View style={styles.exerciseCardContainer}>
        <AppCard gradient>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseInfo}>
            {formatSetsValue(exercise.targetSets)} Sets x {formatRepsValue(exercise.targetReps)} Reps
            {exercise.targetWeight && ` (${exercise.targetWeight} kg)`}
          </Text>
        </AppCard>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {editing ? (
          /* Edit Form */
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Egzersiz Adı *</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Egzersiz adı"
                placeholderTextColor={theme.colors.subtext}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Set Sayısı *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editTargetSets}
                  onChangeText={setEditTargetSets}
                  placeholder="3 veya 3-4"
                  placeholderTextColor={theme.colors.subtext}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Tekrar Sayısı *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editTargetReps}
                  onChangeText={setEditTargetReps}
                  placeholder="12 veya 10-12"
                  placeholderTextColor={theme.colors.subtext}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ağırlık (kg)</Text>
              <TextInput
                style={styles.textInput}
                value={editTargetWeight}
                onChangeText={setEditTargetWeight}
                placeholder="Opsiyonel"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.buttonRow}>
              <AppButton title="Kaydet" onPress={handleSaveChanges} />
              <AppButton title="Sil" onPress={handleDeleteExercise} variant="secondary" />
            </View>
          </View>
        ) : (
          /* Display Info */
          <View style={styles.infoContainer}>
            {performanceHistory.length === 0 ? (
              <View style={styles.emptyPerformance}>
                <Ionicons name="bar-chart" size={64} color={theme.colors.subtext} />
                <Text style={styles.emptyPerformanceTitle}>Henüz Performans Kaydı Yok</Text>
                <Text style={styles.emptyPerformanceDesc}>
                  Bu egzersiz için henüz antrenman kaydı bulunmuyor
                </Text>
              </View>
            ) : (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Performans Geçmişi ({performanceHistory.length})</Text>
                {(showAllHistory ? performanceHistory : performanceHistory.slice(0, 5)).map((performance) => {
                  const isSelected = selectedPerformances.has(performance.id);
                  return (
                    <TouchableOpacity
                      key={performance.id}
                      style={[
                        styles.performanceItem,
                        isSelected && styles.selectedPerformanceItem
                      ]}
                      onPress={() => handlePerformancePress(performance.id)}
                      onLongPress={() => handleLongPress(performance.id)}
                      delayLongPress={500}
                      activeOpacity={0.7}
                    >
                      <View style={styles.performanceContent}>
                        {selectionMode && (
                          <View style={styles.selectionIndicator}>
                            <Ionicons 
                              name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                              size={24} 
                              color={isSelected ? theme.colors.primary : theme.colors.subtext} 
                            />
                          </View>
                        )}
                        <View style={styles.performanceInfo}>
                          <View style={styles.performanceHeader}>
                            <Text style={styles.performanceDate}>
                              {new Date(performance.date).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </Text>
                            <Text style={styles.performanceTime}>
                              {new Date(performance.date).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Text>
                          </View>
                          <View style={styles.performanceDetails}>
                            <Ionicons name="fitness" size={16} color={theme.colors.primary} />
                            <Text style={styles.performanceText}>
                              {performance.sets.length} Set x {performance.sets[0]?.reps || 0} Tekrar
                              {performance.sets[0]?.weight && ` (${performance.sets[0].weight} kg)`}
                            </Text>
                          </View>
                        </View>
                        {!selectionMode && (
                          <View style={styles.performanceActions}>
                            {performance.notes && (
                              <TouchableOpacity
                                style={styles.noteButton}
                                onPress={() => handleShowNote(performance.notes!)}
                                activeOpacity={0.7}
                              >
                                <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              style={styles.deletePerformanceButton}
                              onPress={() => handleDeletePerformance(performance.id)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {performanceHistory.length > 5 && (
                  <TouchableOpacity onPress={() => setShowAllHistory(prev => !prev)}>
                    <Text style={styles.moreText}>
                      {showAllHistory
                        ? 'Daha az göster'
                        : `+${performanceHistory.length - 5} daha fazla kayıt`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Not Görüntüleme Modali */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={noteModalVisible}
        onRequestClose={handleCloseNoteModal}
      >
        <View style={styles.noteModalOverlay}>
          <View style={styles.noteModalContent}>
            <View style={styles.noteModalHeader}>
              <Text style={styles.noteModalTitle}>Egzersiz Notu</Text>
              <TouchableOpacity 
                style={styles.noteCloseButton}
                onPress={handleCloseNoteModal}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.noteText}>{selectedNote}</Text>
          </View>
        </View>
      </Modal>

      {/* Custom Alert */}
      <AlertComponent />
    </KeyboardAvoidingView>
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
    marginBottom: 20,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  exerciseCardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
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
  scrollView: {
    flex: 1,
  },
  editForm: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyPerformance: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyPerformanceTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyPerformanceDesc: {
    color: theme.colors.subtext,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  performanceItem: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedPerformanceItem: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  performanceContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectionIndicator: {
    marginRight: 12,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  performanceDate: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  performanceTime: {
    color: theme.colors.subtext,
    fontSize: 12,
  },
  performanceDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  performanceText: {
    color: theme.colors.text,
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.9,
  },
  performanceActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteButton: {
    padding: 8,
    marginRight: 8,
  },
  deletePerformanceButton: {
    padding: 8,
  },
  moreText: {
    color: theme.colors.subtext,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorBackButtonText: {
    color: theme.colors.primaryOn,
    fontSize: 16,
    fontWeight: "600",
  },
  // Note Modal Styles
  noteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noteModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "60%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  noteModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  noteModalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  noteCloseButton: {
    padding: 4,
  },
  noteText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
});
