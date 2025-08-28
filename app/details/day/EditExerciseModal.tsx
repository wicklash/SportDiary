import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { theme } from "../../theme/theme";
import { Exercise } from "../../types/index";
import { formatRepsValue, formatSetsValue } from "../../utils/formatters";
import { parseRepsValue, parseSetsValue } from "../../utils/parsers";

interface EditExerciseModalProps {
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
  onSave: (updatedExercise: Exercise) => void;
  loading?: boolean;
}

export default function EditExerciseModal({
  visible,
  exercise,
  onClose,
  onSave,
  loading = false,
}: EditExerciseModalProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [notes, setNotes] = useState("");

  // Exercise değiştiğinde veya modal açıldığında form alanlarını güncelle
  useEffect(() => {
    if (exercise && visible) {
      setExerciseName(exercise.name);
      setTargetSets(formatSetsValue(exercise.targetSets));
      setTargetReps(formatRepsValue(exercise.targetReps));
      setTargetWeight(exercise.targetWeight?.toString() || "");
      setNotes(exercise.notes || "");
    }
  }, [exercise, visible]);

  const handleSave = () => {
    if (!exercise) return;

    if (!exerciseName.trim() || !targetSets.trim() || !targetReps.trim()) {
      Alert.alert("Hata", "Lütfen tüm gerekli alanları doldurun");
      return;
    }

    const updatedExercise: Exercise = {
      ...exercise,
      name: exerciseName.trim(),
      targetSets: parseSetsValue(targetSets),
      targetReps: parseRepsValue(targetReps),
      targetWeight: targetWeight.trim() ? parseInt(targetWeight) : undefined,
      notes: notes.trim() || undefined,
    };

    onSave(updatedExercise);
  };

  const handleClose = () => {
    // Form'u temizle
    setExerciseName("");
    setTargetSets("");
    setTargetReps("");
    setTargetWeight("");
    setNotes("");
    onClose();
  };

  if (!exercise) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Egzersizi Düzenle</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color={theme.colors.subtext} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Egzersiz Adı */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Egzersiz Adı</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Egzersiz adını girin"
                placeholderTextColor={theme.colors.subtext}
                value={exerciseName}
                onChangeText={setExerciseName}
                maxLength={50}
              />
            </View>

            {/* Hedef Set Sayısı */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hedef Set Sayısı</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Örn: 3-5"
                placeholderTextColor={theme.colors.subtext}
                value={targetSets}
                onChangeText={setTargetSets}
                maxLength={20}
              />
            </View>

            {/* Hedef Tekrar Sayısı */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hedef Tekrar Sayısı</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Örn: 8-12"
                placeholderTextColor={theme.colors.subtext}
                value={targetReps}
                onChangeText={setTargetReps}
                maxLength={20}
              />
            </View>

                         {/* Hedef Ağırlık */}
             <View style={styles.inputGroup}>
               <Text style={styles.inputLabel}>Hedef Ağırlık (kg)</Text>
               <TextInput
                 style={styles.textInput}
                 placeholder="Örn: 50 (opsiyonel)"
                 placeholderTextColor={theme.colors.subtext}
                 value={targetWeight}
                 onChangeText={setTargetWeight}
                 keyboardType="numeric"
                 maxLength={10}
               />
             </View>

             {/* Notlar */}
             <View style={styles.inputGroup}>
               <Text style={styles.inputLabel}>Notlar (Opsiyonel)</Text>
               <TextInput
                 style={[styles.textInput, styles.textArea]}
                 placeholder="Bu egzersiz için notlarınız..."
                 placeholderTextColor={theme.colors.subtext}
                 value={notes}
                 onChangeText={setNotes}
                 multiline={true}
                 numberOfLines={3}
                 maxLength={300}
               />
             </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
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
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primaryOn,
  },
});
