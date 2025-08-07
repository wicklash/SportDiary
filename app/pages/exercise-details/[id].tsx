import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StorageService } from "../../services/StorageService";
import { Program, Day, Exercise, Performance, formatSetsValue, formatRepsValue, parseSetsValue, parseRepsValue } from "../../types";

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
  
  // Edit form states
  const [editName, setEditName] = useState("");
  const [editTargetSets, setEditTargetSets] = useState("");
  const [editTargetReps, setEditTargetReps] = useState("");
  const [editTargetWeight, setEditTargetWeight] = useState("");
  const [editRestTime, setEditRestTime] = useState("");
  const [editNotes, setEditNotes] = useState("");

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
        setEditRestTime(exerciseData.restTime?.toString() || "");
        setEditNotes(exerciseData.notes || "");
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
        restTime: editRestTime ? parseInt(editRestTime) : undefined,
        notes: editNotes.trim() || undefined,
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
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Egzersiz Detayları</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setEditing(!editing)}
        >
          <Ionicons 
            name={editing ? "close" : "create"} 
            size={24} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </View>

      {/* Exercise Card */}
      <View style={styles.exerciseCardContainer}>
        <LinearGradient
          colors={['#2E86AB', '#A23B72']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.exerciseCard}
        >
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseInfo}>
            {formatSetsValue(exercise.targetSets)} Sets x {formatRepsValue(exercise.targetReps)} Reps
            {exercise.targetWeight && ` (${exercise.targetWeight} kg)`}
          </Text>
        </LinearGradient>
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

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
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
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Dinlenme (sn)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editRestTime}
                  onChangeText={setEditRestTime}
                  placeholder="60"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notlar</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Egzersiz hakkında notlarınız..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveChanges}
              >
                <Ionicons name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Kaydet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteExercise}
              >
                <Ionicons name="trash" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Display Info */
          <View style={styles.infoContainer}>


            {exercise.notes && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Notlar</Text>
                <Text style={styles.notesText}>{exercise.notes}</Text>
              </View>
            )}

            {performanceHistory.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Performans Geçmişi</Text>
                {performanceHistory.slice(0, 5).map((performance, index) => (
                  <View key={performance.id} style={styles.performanceItem}>
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
                ))}
                {performanceHistory.length > 5 && (
                  <Text style={styles.moreText}>
                    +{performanceHistory.length - 5} daha fazla kayıt
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
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
    color: "#ffffff",
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
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  exerciseInfo: {
    color: "#ffffff",
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
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#2a2a2a",
    color: "#ffffff",
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3a3a3a",
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
    backgroundColor: "#2a2a2a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#ffffff",
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
    color: "#ffffff",
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  notesText: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  performanceItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  performanceDate: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  performanceTime: {
    color: "#8E8E93",
    fontSize: 12,
  },
  performanceDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  performanceText: {
    color: "#ffffff",
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.9,
  },
  moreText: {
    color: "#8E8E93",
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
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
