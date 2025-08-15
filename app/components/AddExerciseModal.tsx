import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import { SetsValue, RepsValue } from "../types";
import { parseSetsValue, parseRepsValue } from "../utils/parsers";
import { useCustomAlert, showErrorAlert } from "../hooks/useCustomAlert";

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExercise: (exerciseData: {
    name: string;
    targetSets: SetsValue;
    targetReps: RepsValue;
    targetWeight?: number;
  }) => void;
}

export default function AddExerciseModal({ 
  visible, 
  onClose, 
  onAddExercise 
}: AddExerciseModalProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const { showAlert, AlertComponent } = useCustomAlert();

  const handleSubmit = () => {
    if (!exerciseName.trim() || !targetSets.trim() || !targetReps.trim()) {
      showErrorAlert(showAlert, "Lütfen tüm alanları doldurun");
      return;
    }

    onAddExercise({
      name: exerciseName.trim(),
      targetSets: parseSetsValue(targetSets),
      targetReps: parseRepsValue(targetReps),
      targetWeight: targetWeight.trim() ? parseInt(targetWeight) : undefined,
    });

    // Form'u temizle
    setExerciseName("");
    setTargetSets("");
    setTargetReps("");
    setTargetWeight("");
  };

  const handleCancel = () => {
    onClose();
    // Form'u temizle
    setExerciseName("");
    setTargetSets("");
    setTargetReps("");
    setTargetWeight("");
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
              style={styles.createButton}
              onPress={handleSubmit}
            >
              <Text style={styles.createButtonText}>Ekle</Text>
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
});