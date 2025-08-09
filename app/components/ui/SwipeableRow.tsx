import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { theme } from "../../theme/theme";

export default function SwipeableRow({ children, onDelete }: { children: ReactNode; onDelete: () => void }) {
  const ref = useRef<Swipeable | null>(null);

  const renderRightActions = () => (
    <View
      style={{
        width: 88,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.danger,
        borderTopRightRadius: theme.radius.l,
        borderBottomRightRadius: theme.radius.l,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          onDelete();
          if (ref.current) ref.current.close();
        }}
        activeOpacity={0.8}
        style={{ alignItems: "center" }}
      >
        <Ionicons name="trash" size={22} color={theme.colors.primaryOn} />
        <Text style={{ color: theme.colors.primaryOn, marginTop: 6, fontWeight: "700" }}>Sil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable ref={ref} renderRightActions={renderRightActions} overshootRight={false}>
      {children}
    </Swipeable>
  );
}


