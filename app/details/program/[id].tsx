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
import { AppButton, AppCard, SwipeableRow } from "../../components";
import { showConfirmAlert, showErrorAlert, showSuccessAlert, useCustomAlert } from "../../hooks";
import { StorageService } from "../../services/storage";
import { theme } from "../../theme/theme";
import { Day, Program } from "../../types";

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dayName, setDayName] = useState("");
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProgram();
    }
  }, [id]);

  // Sayfa her odaklandığında verileri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadProgram();
      }
    }, [id])
  );

  const loadProgram = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const programData = await StorageService.getProgram(id as string);
      setProgram(programData);
    } catch (error) {
      console.error('Program yüklenirken hata:', error);
      setError('Program yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDay = async () => {
    if (!dayName.trim()) {
      showErrorAlert(showAlert, "Lütfen gün adı girin");
      return;
    }

    if (!program) return;

    try {
      setLoading(true);
      setError(null);
      
      await StorageService.addDayToProgram(program.id, {
        name: dayName.trim(),
        exercises: [],
        order: program.days.length + 1,
        programId: program.id, // Day interface'inde gerekli field
      });
      
      // Programı yeniden yükle
      await loadProgram();
      
      // Modal'ı kapat ve form'u temizle
      setModalVisible(false);
      setDayName("");
      
      showSuccessAlert(showAlert, `"${dayName}" günü eklendi!`);
    } catch (error) {
      console.error('Gün ekleme hatası:', error);
      setError('Gün eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setDayName("");
  };

  const handleDayPress = (day: Day) => {
    if (program?.id) {
      router.push(`/details/day/${day.id}?programId=${program.id}` as any);
    }
  };

  const handleDeleteDay = async (day: Day) => {
    if (!program) return;
    
    showConfirmAlert(
      showAlert,
      "Günü Sil",
      `"${day.name}" gününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      async () => {
        try {
          setLoading(true);
          setError(null);
          
          await StorageService.deleteDay(program.id, day.id);
          await loadProgram();
          showSuccessAlert(showAlert, "Gün başarıyla silindi");
        } catch (error) {
          console.error('Gün silme hatası:', error);
          setError('Gün silinemedi');
        } finally {
          setLoading(false);
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
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.danger} />
          <Text style={styles.errorText}>Program bulunamadı</Text>
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Program Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Workout Days Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Workout Days</Text>
      </View>

      {/* Days List */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {program.days.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar" size={64} color={theme.colors.subtext} />
            <Text style={styles.emptyTitle}>Henüz Gün Yok</Text>
            <Text style={styles.emptyDescription}>
              İlk antrenman gününüzü eklemek için aşağıdaki butonu kullanın
            </Text>
          </View>
        ) : (
          program.days.map((day, index) => (
            <SwipeableRow
              key={day.id}
              onDelete={() => handleDeleteDay(day)}
            >
              <TouchableOpacity
                style={styles.dayCard}
                onPress={() => handleDayPress(day)}
                onLongPress={() => {
                  // Uzun basınca: hızlı yeniden adlandırma (modal)
                  setDayName(day.name);
                  setModalVisible(true);
                }}
                delayLongPress={500}
              >
                <AppCard>
                  <View style={styles.dayContent}>
                    <View style={styles.dayInfo}>
                      <Text style={styles.dayName}>Gün {index + 1}: {day.name}</Text>
                      <Text style={styles.dayExerciseCount}>
                        {day.exercises.length} egzersiz
                        {day.exercises.length > 0 && ` • ${day.exercises.reduce((total, exercise) => {
                          const sets = typeof exercise.targetSets === 'number' ? exercise.targetSets : exercise.targetSets.max;
                          return total + sets;
                        }, 0)} set`}
                      </Text>
                    </View>
                    <View style={styles.dayIconContainer}>
                      <Ionicons name="fitness" size={24} color={theme.colors.primary} />
                      <Ionicons name="chevron-forward" size={20} color={theme.colors.subtext} />
                    </View>
                  </View>
                </AppCard>
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
                <Ionicons name="close" size={24} color={theme.colors.subtext} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gün Adı *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Örn: Push Day, Pull Day, Legs"
                  placeholderTextColor={theme.colors.subtext}
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
    backgroundColor: theme.colors.background 
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
    fontWeight: "bold" 
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: { 
    color: theme.colors.text, 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dayCard: { 
    marginHorizontal: 16, 
    marginBottom: 12,
  },
  dayContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayInfo: {
    flex: 1,
  },
  dayName: { 
    color: theme.colors.text, 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 4 
  },
  dayExerciseCount: { 
    color: theme.colors.subtext, 
    fontSize: 14 
  },
  dayIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: { 
    color: theme.colors.text, 
    fontSize: 20, 
    fontWeight: "bold", 
    marginTop: 16, 
    marginBottom: 8 
  },
  emptyDescription: { 
    color: theme.colors.subtext, 
    fontSize: 16, 
    textAlign: "center", 
    lineHeight: 24 
  },
  buttonContainer: { 
    paddingHorizontal: 20, 
    paddingVertical: 20, 
    paddingBottom: 40 
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
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
