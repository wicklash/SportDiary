import React from "react";
import { Text, View } from "react-native";
import { theme } from "../../theme/theme";

export default function StatChip({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      {icon}
      <Text style={{ color: theme.colors.text, fontWeight: "600", marginLeft: icon ? theme.spacing.s : 0 }}>
        {label}
      </Text>
    </View>
  );
}
