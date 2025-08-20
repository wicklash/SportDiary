import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { theme } from "../../theme/theme";

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  exerciseName: string;
  targetSets: string;
  targetReps: string;
  targetWeight: string;
  loading: boolean;
  onExerciseNameChange: (text: string) => void;
  onTargetSetsChange: (text: string) => void;
  onTargetRepsChange: (text: string) => void;
  onTargetWeightChange: (text: string) => void;
}

export default function AddExerciseModal({
  visible,
  onClose,
  onSubmit,
  exerciseName,
  targetSets,
  targetReps,
  targetWeight,
  loading,
  onExerciseNameChange,
  onTargetSetsChange,
  onTargetRepsChange,
  onTargetWeightChange,
}: AddExerciseModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yeni Egzersiz Ekle</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
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
                onChangeText={onExerciseNameChange}
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
                  onChangeText={onTargetSetsChange}
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
                  onChangeText={onTargetRepsChange}
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
                onChangeText={onTargetWeightChange}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* Modal Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={onSubmit}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? 'Ekleniyor...' : 'Ekle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
