import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { StorageService } from "../../services/StorageService";
import { Program, Day, SetsValue, RepsValue } from "../../types";
import ExerciseCard from "../../components/ExerciseCard";
import AddExerciseModal from "../../components/AddExerciseModal";

export default function DayDetailScreen() {
  const { id, programId } = useLocalSearchParams<{ id: string; programId: string }>();
  const [day, setDay] = useState<Day | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

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

      // Veriyi yeniden yükle
      await loadDayData();
      
      // Modal'ı kapat
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

  const handleMarkExerciseComplete = async (exerciseId: string) => {
    if (!program || !day) return;

    try {
      await StorageService.logExercisePerformance(exerciseId, program.id, day.id);
      
      // Veriyi yeniden yükle
      await loadDayData();
      
      Alert.alert("Tebrikler! 🎉", "Egzersiz tamamlandı ve performansınız kaydedildi!");
    } catch (error) {
      console.error('Egzersiz tamamlama hatası:', error);
      Alert.alert("Hata", "Egzersiz tamamlanırken bir hata oluştu");
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
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Day</Text>
        <View style={{ width: 28 }} />
      </View>

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
            />
          ))
        )}
      </ScrollView>

      {/* Add Exercise Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.addExerciseButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={24} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.addExerciseButtonText}>Egzersiz Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onAddExercise={handleAddExercise}
      />
    </View>
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
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: "#ffffff",
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
    minHeight: 400,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    color: "#8E8E93",
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
    backgroundColor: "#1a1a1a",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  addExerciseButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addExerciseButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
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

});