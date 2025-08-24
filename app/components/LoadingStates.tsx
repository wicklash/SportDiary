import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme/theme";

interface LoadingStatesProps {
  loading: boolean;
  data: any | any[];
  errorMessage?: string;
  loadingMessage?: string;
  showSkeleton?: boolean;
}

export default function LoadingStates({ 
  loading, 
  data, 
  errorMessage = "Veri bulunamadı",
  loadingMessage = "Yükleniyor...",
  showSkeleton = false
}: LoadingStatesProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const spin = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 800, // Daha hızlı animasyon
          useNativeDriver: true,
        })
      );
      spin.start();

      // Fade in animasyonu
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      return () => spin.stop();
    }
  }, [loading, spinValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading) {
    if (showSkeleton) {
      return (
        <Animated.View style={[styles.skeletonContainer, { opacity: fadeValue }]}>
          {/* Header skeleton */}
          <View style={styles.skeletonHeader} />
          
          {/* Exercise card skeleton */}
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonCardContent}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSubtitle} />
            </View>
          </View>
          
          {/* Charts skeleton */}
          <View style={styles.skeletonSection}>
            <View style={styles.skeletonSectionTitle} />
            <View style={styles.skeletonChart} />
          </View>
          
          {/* Stats skeleton */}
          <View style={styles.skeletonSection}>
            <View style={styles.skeletonSectionTitle} />
            <View style={styles.skeletonStats}>
              <View style={styles.skeletonStat} />
              <View style={styles.skeletonStat} />
              <View style={styles.skeletonStat} />
            </View>
          </View>
        </Animated.View>
      );
    }

    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="refresh" size={48} color={theme.colors.primary} />
        </Animated.View>
        <Text style={styles.loadingText}>{loadingMessage}</Text>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    );
  }

  // data array ise length kontrolü, tek obje ise varlık kontrolü
  const hasData = Array.isArray(data) ? data.length > 0 : !!data;

  if (!hasData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={theme.colors.danger} />
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity 
          style={styles.errorBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorBackButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginHorizontal: 3,
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
  // Skeleton styles
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  skeletonHeader: {
    height: 60,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  skeletonCardContent: {
    alignItems: 'center',
  },
  skeletonTitle: {
    width: 120,
    height: 24,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: 200,
    height: 16,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
  },
  skeletonSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  skeletonSectionTitle: {
    width: 150,
    height: 18,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonChart: {
    width: '100%',
    height: 120,
    backgroundColor: theme.colors.border,
    borderRadius: 8,
  },
  skeletonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  skeletonStat: {
    width: 60,
    height: 40,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    color: theme.colors.text,
    fontSize: 18,
    marginTop: 16,
    marginBottom: 32,
    textAlign: "center",
  },
  errorBackButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorBackButtonText: {
    color: theme.colors.primaryOn,
    fontSize: 16,
    fontWeight: "600",
  },
});
