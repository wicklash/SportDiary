import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
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
  View
} from "react-native";
import { AppButton, AppCard, SwipeableRow } from "../components";
import { showConfirmAlert, showErrorAlert, showSuccessAlert, useCustomAlert } from "../hooks";
import { StorageService } from "../services/storage";
import { theme } from "../theme/theme";
import { ProgramSummary } from "../types/index";

export default function ProgramsScreen() {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sayfa yüklendiğinde programları getir
  useEffect(() => {
    loadPrograms();
  }, []);

  // Sayfa her odaklandığında verileri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      loadPrograms();
    }, [])
  );

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const programSummaries = await StorageService.getProgramSummaries();
      setPrograms(programSummaries);
    } catch (error) {
      console.error('Programlar yüklenirken hata:', error);
      setError('Programlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!programName.trim()) {
      showErrorAlert(showAlert, "Lütfen program adı girin");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await StorageService.saveProgram({
        name: programName.trim(),
        description: programDescription.trim() || undefined,
        days: [], // Başlangıçta boş günler
      });
      
      // Programları yeniden yükle
      await loadPrograms();
      
      // Modal'ı kapat ve form'u temizle
      setModalVisible(false);
      setProgramName("");
      setProgramDescription("");
      
      showSuccessAlert(showAlert, `"${programName}" programı oluşturuldu!`);
    } catch (error) {
      console.error('Program oluşturma hatası:', error);
      setError('Program oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setProgramName("");
    setProgramDescription("");
  };

  const handleProgramPress = (program: ProgramSummary) => {
    router.push(`/details/program/${program.id}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Programs</Text>
      </View>

      {/* Program List */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="refresh" size={64} color="#93b2c8" />
            <Text style={styles.emptyTitle}>Yükleniyor...</Text>
          </View>
        ) : programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness" size={64} color="#93b2c8" />
            <Text style={styles.emptyTitle}>Henüz Program Yok</Text>
            <Text style={styles.emptyDescription}>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              İlk antrenman programınızı oluşturmak için aşağıdaki "New Program" butonuna tıklayın
            </Text>
          </View>
        ) : (
          programs.map((program) => (
            <SwipeableRow
              key={program.id}
              onDelete={() => {
                showConfirmAlert(
                  showAlert,
                  "Programı Sil",
                  `"${program.name}" programını silmek istediğinize emin misiniz?`,
                  async () => {
                    try {
                      setLoading(true);
                      setError(null);
                      
                      await StorageService.deleteProgram(program.id);
                      await loadPrograms();
                    } catch (error) {
                      console.error('Program silme hatası:', error);
                      setError('Program silinemedi');
                    } finally {
                      setLoading(false);
                    }
                  }
                );
              }}
            >
              <TouchableOpacity style={styles.programCard} onPress={() => handleProgramPress(program)} onLongPress={() => {
                // Uzun basınca: hızlı yeniden adlandırma akışı (modal)
                setProgramName(program.name);
                setProgramDescription(program.description || "");
                setModalVisible(true);
              }} delayLongPress={500}>
                <AppCard>
                  <View style={styles.programContent}>
                    <View style={styles.programInfo}>
                      <Text style={styles.programDuration}>
                        {program.dayCount > 0 
                          ? `${program.dayCount} gün • ${program.totalExercises} egzersiz`
                          : "Henüz gün eklenmedi"}
                      </Text>
                      <Text style={styles.programTitle}>{program.name}</Text>
                      <Text style={styles.programDescription}>
                        {program.description || "Açıklama eklenmedi"}
                      </Text>
                    </View>
                    <View style={styles.programImagePlaceholder}>
                      <Ionicons name="fitness" size={28} color={theme.colors.subtext} />
                    </View>
                  </View>
                </AppCard>
              </TouchableOpacity>
            </SwipeableRow>
          ))
        )}
      </ScrollView>

      {/* New Program Button */}
      <View style={styles.buttonContainer}>
        <AppButton title="New Program" onPress={() => setModalVisible(true)} />
      </View>

      {/* Create Program Modal */}
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
                <Text style={styles.modalTitle}>Yeni Program Oluştur</Text>
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
                <Text style={styles.inputLabel}>Program Adı *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Örn: Full Body Program"
                  placeholderTextColor={theme.colors.subtext}
                  value={programName}
                  onChangeText={setProgramName}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Açıklama (Opsiyonel)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Program hakkında kısa bir açıklama..."
                  placeholderTextColor={theme.colors.subtext}
                  value={programDescription}
                  onChangeText={setProgramDescription}
                  multiline={true}
                  numberOfLines={3}
                  maxLength={200}
                />
              </View>
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.createButton} onPress={handleCreateProgram}>
                <Text style={styles.createButtonText}>Oluştur</Text>
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerTitle: { color: theme.colors.text, fontSize: 20, fontWeight: "bold", textAlign: "center" },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40, // Daha az boşluk
  },
  programCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  programContent: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
  },
  programInfo: {
    flex: 2,
    gap: 4,
  },
  programDuration: { color: theme.colors.subtext, fontSize: 14, fontWeight: "400" },
  programTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "bold", lineHeight: 20 },
  programDescription: { color: theme.colors.subtext, fontSize: 14, fontWeight: "400", lineHeight: 20 },
  programImage: {
    flex: 1,
    aspectRatio: 16 / 9,
    minHeight: 80,
  },
  programImageStyle: {
    borderRadius: 12,
  },
  programImagePlaceholder: {
    flex: 1,
    aspectRatio: 16 / 9,
    minHeight: 80,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20, // Daha az alt boşluk
  },
  newPlanButton: {},
  buttonText: { color: theme.colors.text, fontSize: 16, fontWeight: "bold" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: { color: theme.colors.text, fontSize: 20, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  emptyDescription: { color: theme.colors.subtext, fontSize: 16, textAlign: "center", lineHeight: 24 },
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
  modalTitle: { color: theme.colors.text, fontSize: 20, fontWeight: "bold" },
  closeButton: {
    padding: 4,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: { color: theme.colors.text, fontSize: 16, fontWeight: "500", marginBottom: 8 },
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
    height: 80,
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
  cancelButtonText: { color: theme.colors.subtext, fontSize: 16, fontWeight: "600" },
  createButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: { color: theme.colors.primaryOn, fontSize: 16, fontWeight: "600" },
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
