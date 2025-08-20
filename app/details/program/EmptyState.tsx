import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme/theme";

export default function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="calendar" size={64} color={theme.colors.subtext} />
      <Text style={styles.emptyTitle}>Henüz Gün Yok</Text>
      <Text style={styles.emptyDescription}>
        İlk antrenman gününüzü eklemek için aşağıdaki butonu kullanın
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: { 
    color: theme.colors.text, 
    fontSize: 20, 
    fontWeight: "bold", 
    marginTop: 16, 
    marginBottom: 8 
  },
  emptyDescription: { 
    color: theme.colors.subtext, 
    fontSize: 16, 
    textAlign: "center", 
    lineHeight: 24 
  },
});
