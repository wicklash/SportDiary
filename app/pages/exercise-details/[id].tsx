import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import { StorageService } from "../../services/StorageService";
import { theme } from "../../theme/theme";
import { Day, Exercise, Performance, Program, formatRepsValue, formatSetsValue, parseRepsValue, parseSetsValue } from "../../types";

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

  const handleDeletePerformance = async (performanceId: string) => {
    Alert.alert(
      "Performans Kaydını Sil",
      "Bu performans kaydını silmek istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.deletePerformance(performanceId);
              // Performans geçmişini yeniden yükle
              if (exercise) {
                const history = await StorageService.getExerciseHistory(exercise.id);
                setPerformanceHistory(history);
              }
            } catch (error) {
              console.error('Performans silme hatası:', error);
              Alert.alert("Hata", "Performans kaydı silinirken bir hata oluştu");
            }
          }
        }
      ]
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
    Alert.alert(
      "Seçili Kayıtları Sil",
      `${count} performans kaydını silmek istediğinize emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              const idsToDelete = Array.from(selectedPerformances);
              
              // Seri olarak sil
              for (const id of idsToDelete) {
                await StorageService.deletePerformance(id);
              }
              
              // Performans geçmişini yeniden yükle
              if (exercise) {
                const history = await StorageService.getExerciseHistory(exercise.id);
                setPerformanceHistory(history);
              }
              
              // Seçim modundan çık
              setSelectionMode(false);
              setSelectedPerformances(new Set());
            } catch (error) {
              console.error('Toplu silme hatası:', error);
              Alert.alert("Hata", "Performans kayıtları silinirken bir hata oluştu");
            }
          }
        }
      ]
    );
  };
  
  // Edit form states
  const [editName, setEditName] = useState("");
  const [editTargetSets, setEditTargetSets] = useState("");
  const [editTargetReps, setEditTargetReps] = useState("");
  const [editTargetWeight, setEditTargetWeight] = useState("");


  useEffect(() => {
    if (id && dayId && programId) {
      loadExerciseData();
    }
  }, [id, dayId, programId]);

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
        const history = await StorageService.getExerciseHistory(exerciseData.id);
        setPerformanceHistory(history);
      }
    } catch (error) {
      console.error('Egzersiz verisi yüklenirken hata:', error);
      Alert.alert('Hata', 'Egzersiz verisi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!exercise || !program || !day) return;

    try {
      const updatedExercise = {
        ...exercise,
        name: editName.trim(),
        targetSets: parseSetsValue(editTargetSets),
        targetReps: parseRepsValue(editTargetReps),
        targetWeight: editTargetWeight ? parseInt(editTargetWeight) : undefined,
      };

      // StorageService'te updateExercise fonksiyonu olmadığı için program güncelleme kullanacağız
      const updatedDay = {
        ...day,
        exercises: day.exercises.map(ex => 
          ex.id === exercise.id ? updatedExercise : ex
        )
      };

      const updatedProgram = {
        ...program,
        days: program.days.map(d => 
          d.id === day.id ? updatedDay : d
        )
      };

      await StorageService.updateProgram(program.id, updatedProgram);
      
      setExercise(updatedExercise);
      setEditing(false);
      
      Alert.alert("Başarılı", "Egzersiz bilgileri güncellendi!");
    } catch (error) {
      console.error('Egzersiz güncelleme hatası:', error);
      Alert.alert("Hata", "Egzersiz güncellenirken bir hata oluştu");
    }
  };

  const handleDeleteExercise = async () => {
    if (!exercise || !program || !day) return;

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
          onPress: async () => {
            try {
              await StorageService.deleteExercise(program.id, day.id, exercise.id);
              Alert.alert("Başarılı", "Egzersiz silindi!", [
                {
                  text: "Tamam",
                  onPress: () => router.back()
                }
              ]);
            } catch (error) {
              console.error('Egzersiz silme hatası:', error);
              Alert.alert("Hata", "Egzersiz silinirken bir hata oluştu");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={64} color="#4A6FA5" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  if (!exercise || !program || !day) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>Egzersiz bulunamadı</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
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
              <Ionicons name="close" size={28} color={theme.colors.text} />
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
                color={selectedPerformances.size > 0 ? "#FF3B30" : "#666"} 
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Egzersiz Detayları</Text>
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
              <Text style={styles.inputLabel}>Egzersiz Adı</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Egzersiz adı"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Set Sayısı</Text>
                <TextInput
                  style={styles.textInput}
                  value={editTargetSets}
                  onChangeText={setEditTargetSets}
                  placeholder="3 veya 3-4"
                  placeholderTextColor="#8E8E93"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Tekrar Sayısı</Text>
                <TextInput
                  style={styles.textInput}
                  value={editTargetReps}
                  onChangeText={setEditTargetReps}
                  placeholder="12 veya 10-12"
                  placeholderTextColor="#8E8E93"
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
                placeholderTextColor="#8E8E93"
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




            {performanceHistory.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Performans Geçmişi</Text>
                {(showAllHistory ? performanceHistory : performanceHistory.slice(0, 5)).map((performance, index) => {
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
                              color={isSelected ? "#007AFF" : "#666"} 
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
                            <Ionicons name="fitness" size={16} color="#007AFF" />
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
                                <Ionicons name="document-text-outline" size={18} color="#007AFF" />
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              style={styles.deletePerformanceButton}
                              onPress={() => handleDeletePerformance(performance.id)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
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
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.noteText}>{selectedNote}</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  exerciseCardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "#34C759",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    color: theme.colors.text,
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  notesText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
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
    backgroundColor: "#101223",
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
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
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
