import { theme } from "@/theme/theme";
import React from "react";
import { ActivityIndicator, Pressable, Text, ViewStyle } from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost";

export default function AppButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
}) {
  const backgroundColor =
    variant === "primary"
      ? theme.colors.primary
      : variant === "secondary"
      ? theme.colors.surface
      : "transparent";
  const borderWidth = variant === "ghost" ? 1 : 0;
  const borderColor = theme.colors.border;
  const textColor = variant === "ghost" ? theme.colors.text : theme.colors.primaryOn;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          paddingVertical: 14,
          paddingHorizontal: 16,
          alignItems: "center",
          borderRadius: theme.radius.m,
          backgroundColor: pressed ? backgroundColor + "E6" : backgroundColor,
          borderWidth,
          borderColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontWeight: "700", fontSize: 16 }}>{title}</Text>
      )}
    </Pressable>
  );
}


