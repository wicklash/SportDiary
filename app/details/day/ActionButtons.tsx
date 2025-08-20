import React from "react";
import { StyleSheet, View } from "react-native";
import { AppButton } from "../../components";
import { theme } from "../../theme/theme";

interface ActionButtonsProps {
  onAddExercise: () => void;
  onWorkoutDone: () => void;
  selectedCount: number;
}

export default function ActionButtons({
  onAddExercise,
  onWorkoutDone,
  selectedCount,
}: ActionButtonsProps) {
  return (
    <View style={styles.buttonContainer}>
      <AppButton title="Egzersiz Ekle" onPress={onAddExercise} />
      {selectedCount > 0 && (
        <AppButton 
          title={`Workout Done (${selectedCount})`} 
          onPress={onWorkoutDone} 
          variant="secondary" 
          style={{ marginTop: 12 }} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
