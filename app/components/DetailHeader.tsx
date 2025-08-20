import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme/theme";

interface DetailHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  // Yeni özellikler ekleyelim
  selectionMode?: boolean;
  selectedCount?: number;
  onCancelSelection?: () => void;
  onDeleteSelected?: () => void;
  editing?: boolean;
  onToggleEditing?: () => void;
}

export default function DetailHeader({ 
  title, 
  showBackButton = true, 
  rightComponent,
  onBackPress,
  selectionMode = false,
  selectedCount = 0,
  onCancelSelection,
  onDeleteSelected,
  editing = false,
  onToggleEditing
}: DetailHeaderProps) {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Seçim modu için özel header
  if (selectionMode) {
    return (
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={onCancelSelection}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCount} seçili
        </Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={onDeleteSelected}
          disabled={selectedCount === 0}
        >
          <Ionicons 
            name="trash" 
            size={24} 
            color={selectedCount > 0 ? theme.colors.danger : theme.colors.subtext} 
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      {showBackButton ? (
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      {rightComponent ? (
        rightComponent
      ) : editing !== undefined && onToggleEditing ? (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={onToggleEditing}
        >
          <Ionicons 
            name={editing ? "close" : "create"} 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: { 
    color: theme.colors.text, 
    fontSize: 20, 
    fontWeight: "bold" 
  },
});
