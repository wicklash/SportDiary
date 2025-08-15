import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { theme } from "../../theme/theme";

export default function SwipeableRow({ children, onDelete }: { children: ReactNode; onDelete: () => void }) {
  const ref = useRef<Swipeable | null>(null);
  const [rowHeight, setRowHeight] = useState<number>(0);

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const scaleX = progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
    const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
    const iconScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

    return (
      <View
        style={{
          height: "100%",
          paddingLeft: 8, // Kart ile silme butonu arasında mesafe
          paddingRight: 8, // Ekranın sağ kenarından boşluk
        }}
      >
        <Animated.View
          style={{
            width: 88,
            height: rowHeight > 0 ? rowHeight - 8 : 72, // Sabit ve tutarlı boyut
            backgroundColor: theme.colors.danger,
            borderRadius: theme.radius.l,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scaleX }],
            opacity,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              onDelete();
              if (ref.current) ref.current.close();
            }}
            activeOpacity={0.85}
            style={{ 
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              <Ionicons name="trash" size={22} color={theme.colors.primaryOn} />
            </Animated.View>
            <Text style={{ color: theme.colors.primaryOn, marginTop: 6, fontWeight: "700" }}>Sil</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable ref={ref} renderRightActions={renderRightActions as any} overshootRight={false}>
      <View onLayout={(e) => setRowHeight(e.nativeEvent.layout.height)}>
        {children}
      </View>
    </Swipeable>
  );
}


