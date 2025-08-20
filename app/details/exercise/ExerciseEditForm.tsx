import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../../components";
import { theme } from "../../theme/theme";

interface ExerciseEditFormProps {
  editName: string;
  editTargetSets: string;
  editTargetReps: string;
  editTargetWeight: string;
  onEditNameChange: (text: string) => void;
  onEditTargetSetsChange: (text: string) => void;
  onEditTargetRepsChange: (text: string) => void;
  onEditTargetWeightChange: (text: string) => void;
  onSaveChanges: () => void;
  onDeleteExercise: () => void;
}

export default function ExerciseEditForm({
  editName,
  editTargetSets,
  editTargetReps,
  editTargetWeight,
  onEditNameChange,
  onEditTargetSetsChange,
  onEditTargetRepsChange,
  onEditTargetWeightChange,
  onSaveChanges,
  onDeleteExercise,
}: ExerciseEditFormProps) {
  return (
    <View style={styles.editForm}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Egzersiz Adı *</Text>
        <TextInput
          style={styles.textInput}
          value={editName}
          onChangeText={onEditNameChange}
          placeholder="Egzersiz adı"
          placeholderTextColor={theme.colors.subtext}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Set Sayısı *</Text>
          <TextInput
            style={styles.textInput}
            value={editTargetSets}
            onChangeText={onEditTargetSetsChange}
            placeholder="3 veya 3-4"
            placeholderTextColor={theme.colors.subtext}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>Tekrar Sayısı *</Text>
          <TextInput
            style={styles.textInput}
            value={editTargetReps}
            onChangeText={onEditTargetRepsChange}
            placeholder="12 veya 10-12"
            placeholderTextColor={theme.colors.subtext}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ağırlık (kg)</Text>
        <TextInput
          style={styles.textInput}
          value={editTargetWeight}
          onChangeText={onEditTargetWeightChange}
          placeholder="Opsiyonel"
          placeholderTextColor={theme.colors.subtext}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonRow}>
        <AppButton title="Kaydet" onPress={onSaveChanges} />
        <AppButton title="Sil" onPress={onDeleteExercise} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editForm: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
});
