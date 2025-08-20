import { theme } from "@/app/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { DayStorage, ExerciseStorage, PerformanceStorage, ProgramStorage } from "../services/storage";

export default function SettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [programs, performances] = await Promise.all([
        ProgramStorage.getPrograms(),
        PerformanceStorage.getPerformances()
      ]);

      const totalData = {
        programs: programs.length,
        performances: performances.length,
        timestamp: new Date().toISOString()
      };
      
      Alert.alert(
        'Veri Dışa Aktarıldı',
        `${totalData.programs} program, ${totalData.performances} performans kaydı bulundu.`,
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('Veri dışa aktarma hatası:', error);
      setError('Veri dışa aktarılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Bu işlem geri alınamaz! Tüm programlar, egzersizler ve performans kayıtları silinecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              setError(null);
              
              await Promise.all([
                DayStorage.clearAll(),
                ExerciseStorage.clearAll(),
                ProgramStorage.clearAll(),
                PerformanceStorage.clearAll()
              ]);
              
              Alert.alert('Başarılı', 'Tüm veriler başarıyla silindi');
            } catch (error) {
              console.error('Veri silme hatası:', error);
              setError('Veriler silinirken hata oluştu');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleBackupData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const programs = await ProgramStorage.getPrograms();
      const performances = await PerformanceStorage.getPerformances();
      
      const backup = {
        programs,
        performances,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      console.log('Backup data:', backup);
      Alert.alert('Yedek Oluşturuldu', `Yedek oluşturuldu: ${programs.length} program, ${performances.length} performans`);
    } catch (error) {
      console.error('Yedek oluşturma hatası:', error);
      setError('Yedek oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Genel</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
              <Text style={styles.settingText}>Bildirimler</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette-outline" size={24} color={theme.colors.text} />
              <Text style={styles.settingText}>Tema</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Veri</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, loading && styles.settingItemDisabled]} 
            onPress={handleBackupData}
            disabled={loading}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.text} />
              <Text style={styles.settingText}>
                {loading ? 'Yedekleniyor...' : 'Veri Yedeği Oluştur'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, loading && styles.settingItemDisabled]} 
            onPress={handleExportData}
            disabled={loading}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="download-outline" size={24} color={theme.colors.text} />
              <Text style={styles.settingText}>
                {loading ? 'İşleniyor...' : 'Verileri Dışa Aktar'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, loading && styles.settingItemDisabled]} 
            onPress={handleClearAllData}
            disabled={loading}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
              <Text style={[styles.settingText, { color: theme.colors.danger }]}>
                {loading ? 'İşleniyor...' : 'Tüm Verileri Sil'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
        </View>
        
        {error && (
          <View style={styles.errorSection}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
              <Text style={styles.retryButtonText}>Hata Mesajını Temizle</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Daha fazla özellik yakında aktif olacak...</Text>
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
    justifyContent: "center",
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
  content: {
    flex: 1,
    padding: 20,
  },
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingItemDisabled: {
    opacity: 0.7,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  errorSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  comingSoon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoonText: {
    color: theme.colors.subtext,
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
});
