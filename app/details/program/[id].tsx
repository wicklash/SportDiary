import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { AppButton, DetailHeader, ErrorBanner, LoadingStates } from "../../components";
import { showConfirmAlert, showErrorAlert, showSuccessAlert, useCustomAlert } from "../../hooks";
import { StorageService } from "../../services/storage";
import { theme } from "../../theme/theme";
import { Day, Program } from "../../types";
import AddDayModal from "./AddDayModal";
import DaysList from "./DaysList";

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dayName, setDayName] = useState("");
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProgram = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const programData = await StorageService.getProgram(id as string);
      setProgram(programData);
    } catch (error) {
      console.error('Program yüklenirken hata:', error);
      setError('Program yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProgram();
    }
  }, [id, loadProgram]);

  // Sayfa her odaklandığında verileri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadProgram();
      }
    }, [id, loadProgram])
  );

  const handleAddDay = async () => {
    if (!dayName.trim()) {
      showErrorAlert(showAlert, "Lütfen gün adı girin");
      return;
    }

    if (!program) return;

    try {
      setLoading(true);
      setError(null);
      
      await StorageService.addDayToProgram(program.id, {
        name: dayName.trim(),
        exercises: [],
        order: program.days.length + 1,
        programId: program.id, // Day interface'inde gerekli field
      });
      
      // Programı yeniden yükle
      await loadProgram();
      
      // Modal'ı kapat ve form'u temizle
      setModalVisible(false);
      setDayName("");
      
      showSuccessAlert(showAlert, `"${dayName}" günü eklendi!`);
    } catch (error) {
      console.error('Gün ekleme hatası:', error);
      setError('Gün eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setDayName("");
  };

  const handleDayPress = (day: Day) => {
    if (program?.id) {
      router.push(`/details/day/${day.id}?programId=${program.id}` as any);
    }
  };

  const handleDeleteDay = async (day: Day) => {
    if (!program) return;
    
    showConfirmAlert(
      showAlert,
      "Günü Sil",
      `"${day.name}" gününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      async () => {
        try {
          setLoading(true);
          setError(null);
          
          await StorageService.deleteDay(program.id, day.id);
          await loadProgram();
          showSuccessAlert(showAlert, "Gün başarıyla silindi");
        } catch (error) {
          console.error('Gün silme hatası:', error);
          setError('Gün silinemedi');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  if (loading || !program) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LoadingStates 
          loading={loading}
          data={program}
          errorMessage="Program bulunamadı"
        />
        <AlertComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <DetailHeader title="Program Details" />

      {/* Days List */}
      <DaysList
        days={program.days}
        onDayPress={handleDayPress}
        onDayLongPress={(day) => {
          // Uzun basınca: hızlı yeniden adlandırma (modal)
          setDayName(day.name);
          setModalVisible(true);
        }}
        onDeleteDay={handleDeleteDay}
      />

      {/* Add Day Button */}
      <View style={styles.buttonContainer}>
        <AppButton title="Add Workout Day" onPress={() => setModalVisible(true)} />
      </View>

      {/* Add Day Modal */}
      <AddDayModal
        visible={modalVisible}
        dayName={dayName}
        onDayNameChange={setDayName}
        onAddDay={handleAddDay}
        onCancel={handleCancel}
      />

      {/* Error Display */}
      <ErrorBanner
        error={error}
        onDismiss={() => setError(null)}
      />

      {/* Custom Alert */}
      <AlertComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  buttonContainer: { 
    paddingHorizontal: 20, 
    paddingVertical: 20, 
    paddingBottom: 40 
  },
});
