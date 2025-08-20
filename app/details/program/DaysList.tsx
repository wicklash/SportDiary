import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SwipeableRow } from "../../components";
import { theme } from "../../theme/theme";
import { Day } from "../../types/index";
import DayCard from "./DayCard";
import EmptyState from "./EmptyState";

interface DaysListProps {
  days: Day[];
  onDayPress: (day: Day) => void;
  onDayLongPress: (day: Day) => void;
  onDeleteDay: (day: Day) => void;
}

export default function DaysList({ days, onDayPress, onDayLongPress, onDeleteDay }: DaysListProps) {
  if (days.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Workout Days</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day, index) => (
          <SwipeableRow
            key={day.id}
            onDelete={() => onDeleteDay(day)}
          >
            <DayCard
              day={day}
              index={index}
              onPress={onDayPress}
              onLongPress={onDayLongPress}
            />
          </SwipeableRow>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
});
