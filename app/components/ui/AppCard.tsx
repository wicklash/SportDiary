import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import { View } from "react-native";
import { theme } from "../../theme/theme";

export default function AppCard({ children, gradient = false }: { children: ReactNode; gradient?: boolean }) {
  if (gradient) {
    return (
      <LinearGradient
        colors={[...theme.brandGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: theme.radius.l,
          padding: theme.spacing.l,
        }}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.l,
        padding: theme.spacing.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...(theme.shadows.card as object),
      }}
    >
      {children}
    </View>
  );
}



