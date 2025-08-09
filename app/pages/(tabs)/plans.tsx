import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import SwipeableRow from "../../components/ui/SwipeableRow";
import { StorageService } from "../../services/StorageService";
import { theme } from "../../theme/theme";
import { ProgramSummary } from "../../types";

export default function PlansScreen() {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");

  // Sayfa yüklendiğinde programları getir
  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const programSummaries = await StorageService.getProgramSummaries();
      setPrograms(programSummaries);
    } catch (error) {
      console.error('Programlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Programlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!programName.trim()) {
      Alert.alert("Hata", "Lütfen program adı girin");
      return;
    }

    try {
      // StorageService ile program kaydet
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
      
      Alert.alert("Başarılı", `"${programName}" programı oluşturuldu!`);
    } catch (error) {
      console.error('Program oluşturma hatası:', error);
      Alert.alert("Hata", "Program oluşturulurken bir hata oluştu");
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setProgramName("");
    setProgramDescription("");
  };

  const handleProgramPress = (program: ProgramSummary) => {
    router.push(`/pages/program-details/${program.id}` as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plans</Text>
      </View>

      {/* Program List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              İlk antrenman programınızı oluşturmak için aşağıdaki "New Plan" butonuna tıklayın
            </Text>
          </View>
        ) : (
          programs.map((program) => (
            <SwipeableRow
              key={program.id}
              onDelete={async () => {
                try {
                  await StorageService.deleteProgram(program.id);
                  await loadPrograms();
                } catch (e) {
                  Alert.alert('Hata', 'Program silinemedi');
                }
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

      {/* New Plan Button */}
      <View style={styles.buttonContainer}>
        <AppButton title="New Plan" onPress={() => setModalVisible(true)} />
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
                <Ionicons name="close" size={24} color="#93b2c8" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60, // Üstten daha fazla boşluk
    paddingVertical: 12,
    paddingBottom: 8,
  },
  headerTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
  scrollView: {
    flex: 1,
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
    paddingVertical: 20,
    paddingBottom: 40,
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
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
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
});
