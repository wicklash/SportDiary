import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { PerformanceStorage } from "../services/storage";
import { theme } from "../theme/theme";

export default function ProgressScreen() {
  const [stats, setStats] = useState({
    completedWorkouts: 0,
    thisWeek: 0,
    totalExercises: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadProgressStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const performances = await PerformanceStorage.getPerformances();
      
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      
      const thisWeekCount = performances.filter(p => 
        new Date(p.date) >= weekStart
      ).length;
      
      setStats({
        completedWorkouts: performances.length,
        thisWeek: thisWeekCount,
        totalExercises: performances.reduce((total, p) => total + p.sets.length, 0)
      });
    } catch (error) {
      console.error('İlerleme verileri yüklenirken hata:', error);
      setError('İlerleme verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportData = async () => {
    try {
      setLoading(true);
      const performances = await PerformanceStorage.getPerformances();
      
      Alert.alert(
        'Veri Dışa Aktarıldı',
        `${performances.length} performans kaydı bulundu.`,
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('Veri dışa aktarma hatası:', error);
      setError('Veri dışa aktarılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgressStats();
  }, [loadProgressStats]);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProgressStats}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={handleExportData}
          disabled={loading}
        >
          <Text style={styles.exportButtonText}>
            {loading ? 'Yükleniyor...' : 'Dışa Aktar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedWorkouts}</Text>
            <Text style={styles.statLabel}>Tamamlanan Antrenman</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.thisWeek}</Text>
            <Text style={styles.statLabel}>Bu Hafta</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalExercises}</Text>
            <Text style={styles.statLabel}>Toplam Egzersiz</Text>
          </View>
        </View>
        
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Detaylı ilerleme takibi yakında...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Added space-between for export button
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  exportButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exportButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: theme.colors.subtext,
    fontSize: 12,
    textAlign: "center",
  },
  comingSoon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoonText: {
    color: theme.colors.subtext,
    fontSize: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
});