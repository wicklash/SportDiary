import { theme } from "@/app/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function SettingsScreen() {
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
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="download-outline" size={24} color={theme.colors.text} />
              <Text style={styles.settingText}>Verileri Dışa Aktar</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
              <Text style={[styles.settingText, { color: theme.colors.danger }]}>Tüm Verileri Sil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Bu özellikler yakında aktif olacak...</Text>
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