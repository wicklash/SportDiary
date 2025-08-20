import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme/theme";

interface ErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
  variant?: "danger" | "warning" | "info";
}

export default function ErrorBanner({ 
  error, 
  onDismiss, 
  variant = "danger" 
}: ErrorBannerProps) {
  if (!error) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          backgroundColor: theme.colors.warning || "#FFA500",
          iconColor: "#FFF"
        };
      case "info":
        return {
          backgroundColor: theme.colors.info || "#007AFF",
          iconColor: "#FFF"
        };
      default:
        return {
          backgroundColor: theme.colors.danger,
          iconColor: "#FFF"
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.errorBanner, { backgroundColor: variantStyles.backgroundColor }]}>
      <Text style={styles.errorBannerText}>{error}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.errorBannerButton}>
        <Ionicons name="close" size={20} color={variantStyles.iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  errorBannerButton: {
    padding: 4,
    marginLeft: 8,
  },
});
