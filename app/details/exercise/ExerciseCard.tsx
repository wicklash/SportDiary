import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../components";
import { theme } from "../../theme/theme";
import { Exercise } from "../../types/index";

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <View style={styles.exerciseCardContainer}>
      <AppCard gradient>
        <Text style={styles.exerciseName}>{exercise.name}</Text>

      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCardContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  exerciseName: {
    color: theme.colors.primaryOn,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
});
