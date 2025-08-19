import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { showErrorAlert, useCustomAlert } from "../../hooks/useCustomAlert";
import { ExerciseStorage } from "../../services/storage";
import { theme } from "../../theme/theme";
import { parseRepsValue, parseSetsValue } from "../../utils/parsers";

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  programId: string;
  dayId: string;
  onExerciseAdded?: (exerciseName: string) => void;
}

export default function AddExerciseModal({ 
  visible, 
  onClose, 
  programId,
  dayId,
  onExerciseAdded
}: AddExerciseModalProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!exerciseName.trim() || !targetSets.trim() || !targetReps.trim()) {
      showErrorAlert(showAlert, "Lütfen tüm alanları doldurun");
      return;
    }

    const exerciseData = {
      dayId: dayId,
      name: exerciseName.trim(),
      targetSets: parseSetsValue(targetSets),
      targetReps: parseRepsValue(targetReps),
      targetWeight: targetWeight.trim() ? parseInt(targetWeight) : undefined,
    };

    try {
      setLoading(true);
      
      const result = await ExerciseStorage.addExercise(programId, dayId, exerciseData);

      if (result.success && result.data) {
        // Başarılı olduğunda form'u temizle ve modal'ı kapat
        setExerciseName("");
        setTargetSets("");
        setTargetReps("");
        setTargetWeight("");
        
        // Modal'ı kapat ve callback'i çağır (başarı mesajı parent'ta gösterilecek)
        onClose();
        onExerciseAdded?.(exerciseData.name);
      } else {
        // Hata durumunda hata mesajını göster
        const errorMessage = result.error || 'Egzersiz eklenirken hata oluştu';
        showErrorAlert(showAlert, errorMessage);
      }
    } catch (error) {
      // Beklenmeyen hata durumunda
      showErrorAlert(showAlert, 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Modal kapatıldığında form'u temizle
    setExerciseName("");
    setTargetSets("");
    setTargetReps("");
    setTargetWeight("");
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yeni Egzersiz Ekle</Text>
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
              <Text style={styles.inputLabel}>Egzersiz Adı *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Örn: Squats, Bench Press"
                placeholderTextColor={theme.colors.subtext}
                value={exerciseName}
                onChangeText={setExerciseName}
                maxLength={50}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Set Sayısı *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="3 veya 3-4"
                  placeholderTextColor={theme.colors.subtext}
                  value={targetSets}
                  onChangeText={setTargetSets}
                  maxLength={5}
                />
              </View>

              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Tekrar Sayısı *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10 veya 8-12"
                  placeholderTextColor={theme.colors.subtext}
                  value={targetReps}
                  onChangeText={setTargetReps}
                  maxLength={6}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ağırlık (kg)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Opsiyonel - Örn: 80"
                placeholderTextColor={theme.colors.subtext}
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                maxLength={4}
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
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? 'Ekleniyor...' : 'Ekle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Custom Alert */}
      <AlertComponent />
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroupHalf: {
    flex: 1,
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
  createButtonDisabled: {
    opacity: 0.7,
  },
});