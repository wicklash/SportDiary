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
import AppButton from "../../components/ui/AppButton";
import SwipeableRow from "../../components/ui/SwipeableRow";
import { StorageService } from "../../services/StorageService";
import { theme } from "../../theme/theme";
import { Day, Program } from "../../types";

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [dayName, setDayName] = useState("");

  useEffect(() => {
    if (id) {
      loadProgram();
    }
  }, [id]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const programData = await StorageService.getProgram(id as string);
      setProgram(programData);
    } catch (error) {
      console.error('Program yüklenirken hata:', error);
      Alert.alert('Hata', 'Program yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDay = async () => {
    if (!dayName.trim()) {
      Alert.alert("Hata", "Lütfen gün adı girin");
      return;
    }

    if (!program) return;

    try {
      await StorageService.addDayToProgram(program.id, {
        name: dayName.trim(),
        exercises: [],
        order: program.days.length,
      });

      // Programı yeniden yükle
      await loadProgram();
      
      // Modal'ı kapat ve form'u temizle
      setModalVisible(false);
      setDayName("");
      
      Alert.alert("Başarılı", `"${dayName}" günü eklendi!`);
    } catch (error) {
      console.error('Gün ekleme hatası:', error);
      Alert.alert("Hata", "Gün eklenirken bir hata oluştu");
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setDayName("");
  };

  const handleDayPress = (day: Day) => {
    if (program?.id) {
      router.push(`/pages/day-details/${day.id}?programId=${program.id}` as any);
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

  if (!program) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>Program bulunamadı</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Program Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Program Info */}
      <View style={styles.programInfo}>
        <Text style={styles.programName}>{program.name}</Text>
        {program.description && (
          <Text style={styles.programDescription}>{program.description}</Text>
        )}
        <Text style={styles.programStats}>
          {program.days.length} gün • {program.days.reduce((total, day) => total + day.exercises.length, 0)} egzersiz
        </Text>
      </View>

      {/* Workout Days Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Workout Days</Text>
      </View>

      {/* Days List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {program.days.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar" size={64} color="#93b2c8" />
            <Text style={styles.emptyTitle}>Henüz Gün Yok</Text>
            <Text style={styles.emptyDescription}>
              İlk antrenman gününüzü eklemek için aşağıdaki butonu kullanın
            </Text>
          </View>
        ) : (
          program.days.map((day, index) => (
            <SwipeableRow
              key={day.id}
              onDelete={async () => {
                try {
                  await StorageService.deleteDay(program.id, day.id);
                  await loadProgram();
                } catch (e) {
                  Alert.alert('Hata', 'Gün silinemedi');
                }
              }}
            >
              <TouchableOpacity
                style={styles.dayCard}
                onPress={() => handleDayPress(day)}
                onLongPress={() => {
                  // Uzun basınca: hızlı yeniden adlandırma (modal)
                  setModalVisible(true);
                  setDayName(day.name);
                }}
                delayLongPress={500}
              >
                <View style={styles.dayContent}>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>Gün {index + 1}: {day.name}</Text>
                    <Text style={styles.dayExerciseCount}>{day.exercises.length} egzersiz</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.subtext} />
                </View>
              </TouchableOpacity>
            </SwipeableRow>
          ))
        )}
      </ScrollView>

      {/* Add Day Button */}
      <View style={styles.buttonContainer}>
        <AppButton title="Add Workout Day" onPress={() => setModalVisible(true)} />
      </View>

      {/* Add Day Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Gün Ekle</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCancel}
              >
                <Ionicons name="close" size={24} color="#93b2c8" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gün Adı *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Örn: Push Day, Pull Day, Legs"
                  placeholderTextColor="#93b2c8"
                  value={dayName}
                  onChangeText={setDayName}
                  maxLength={30}
                />
              </View>
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleAddDay}
              >
                <Text style={styles.createButtonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "bold" },
  programInfo: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  programName: { color: theme.colors.text, fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  programDescription: { color: theme.colors.subtext, fontSize: 16, marginBottom: 8 },
  programStats: { color: theme.colors.subtext, fontSize: 14 },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "bold" },
  scrollView: {
    flex: 1,
  },
  dayCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: theme.colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
  dayContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayInfo: {
    flex: 1,
  },
  dayName: { color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  dayExerciseCount: { color: theme.colors.subtext, fontSize: 14 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: { color: theme.colors.text, fontSize: 20, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  emptyDescription: { color: theme.colors.subtext, fontSize: 16, textAlign: "center", lineHeight: 24 },
  buttonContainer: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40 },
  addDayButton: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  addDayButtonText: { color: theme.colors.primaryOn, fontSize: 16, fontWeight: "bold" },
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
    backgroundColor: "#1a2832",
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
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#111b22",
    borderColor: "#243847",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#243847",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#93b2c8",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    backgroundColor: "#1991e6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});