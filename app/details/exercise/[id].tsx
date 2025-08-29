import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LoadingStates, PerformanceCharts } from "../../components";
import DetailHeader from "../../components/DetailHeader";
import { showConfirmAlert, showErrorAlert, showSuccessAlert, useCustomAlert } from "../../hooks/useCustomAlert";
import useExerciseState from "../../hooks/useExerciseState";
import { PerformanceStorage, StorageService } from "../../services/storage";
import { theme } from "../../theme/theme";
import { Performance } from "../../types/index";
import ExerciseCard from "./ExerciseCard";
import NoteModal from "./NoteModal";
import PerformanceDetailModal from "./PerformanceDetailModal";
import PerformanceHistory from "./PerformanceHistory";

export default function ExerciseDetailScreen() {
  const { id, dayId, programId } = useLocalSearchParams<{ 
    id: string; 
    dayId: string; 
    programId: string; 
  }>();
  
  const { showAlert, AlertComponent } = useCustomAlert();
  
  // Merkezi state yönetimi
  const { dataState, uiState, performanceState, actions } = useExerciseState(
    id as string, 
    dayId as string, 
    programId as string
  );

  const { exercise, program, day, loading, error } = dataState;
  const { noteModal, performanceDetailModal, selectionMode, showAllHistory } = uiState;
  const { history: performanceHistory, selectedPerformances } = performanceState;

  // İlk yükleme
  useEffect(() => {
    if (id && dayId && programId) {
      actions.loadBasicExerciseData();
    }
  }, [id, dayId, programId, actions.loadBasicExerciseData]);

  // Focus effect - performans geçmişini güncelle
  useFocusEffect(
    useCallback(() => {
      if (exercise?.name) {
        actions.updatePerformanceHistory(exercise.name);
      }
    }, [exercise?.name, actions.updatePerformanceHistory])
  );

  // Performans silme
  const handleDeletePerformance = async (performanceId: string) => {
    if (!exercise?.name) return;
    
    showConfirmAlert(
      showAlert,
      "Performans Kaydını Sil",
      "Bu performans kaydını silmek istediğinize emin misiniz?",
      async () => {
        try {
          await PerformanceStorage.deletePerformance(performanceId);
          await actions.updatePerformanceHistory(exercise.name);
          showSuccessAlert(showAlert, "Performans kaydı silindi!");
        } catch (error) {
          console.error('Performans silme hatası:', error);
          showErrorAlert(showAlert, "Performans kaydı silinirken bir hata oluştu");
        }
      }
    );
  };

  // Not gösterme
  const handleShowNote = (note: string) => {
    actions.toggleNoteModal(true, note);
  };

  // Not modal'ını kapat
  const handleCloseNoteModal = () => {
    actions.toggleNoteModal(false);
  };

  // Uzun basma - seçim modunu aktifleştir
  const handleLongPress = (performanceId: string) => {
    actions.toggleSelectionMode(true);
    actions.setSelectedPerformances(new Set([performanceId]));
  };

  // Performans'a tıklama
  const handlePerformancePress = (performanceId: string) => {
    if (selectionMode) {
      // Seçim modunda - seçimi değiştir
      if (selectedPerformances.has(performanceId)) {
        actions.removeSelectedPerformance(performanceId);
      } else {
        actions.addSelectedPerformance(performanceId);
      }
      
      // Seçim kalmadıysa seçim modundan çık
      if (selectedPerformances.size === 0) {
        actions.toggleSelectionMode(false);
      }
    } else {
      // Normal mod - performans detaylarını göster
      const performance = performanceHistory.find(p => p.id === performanceId);
      if (performance) {
        actions.toggleDetailModal(true, performance);
      }
    }
  };

  // Seçim modundan çık
  const handleCancelSelection = () => {
    actions.toggleSelectionMode(false);
    actions.clearSelected();
  };

  // Performans güncelleme
  const handleSavePerformance = async (updatedPerformance: Performance) => {
    if (!exercise?.name) return;
    
    try {
      await PerformanceStorage.updatePerformance(updatedPerformance.id, updatedPerformance);
      await actions.updatePerformanceHistory(exercise.name);
      
      // Seçili performans detayını güncelle
      actions.toggleDetailModal(true, updatedPerformance);
      
      showSuccessAlert(showAlert, 'Performans başarıyla güncellendi');
    } catch (error) {
      console.error('Performans güncelleme hatası:', error);
      showErrorAlert(showAlert, 'Performans güncellenirken bir hata oluştu');
    }
  };

  // Seçili performansları sil
  const handleDeleteSelected = async () => {
    if (!exercise?.name) return;
    
    const count = selectedPerformances.size;
    showConfirmAlert(
      showAlert,
      "Seçili Kayıtları Sil",
      `${count} performans kaydını silmek istediğinize emin misiniz?`,
      async () => {
        try {
          const idsToDelete = Array.from(selectedPerformances);
          
          // Seri olarak sil
          for (const id of idsToDelete) {
            await PerformanceStorage.deletePerformance(id);
          }
          
          // Performans geçmişini güncelle
          await actions.updatePerformanceHistory(exercise.name);
          
          // Seçim modundan çık
          actions.toggleSelectionMode(false);
          actions.clearSelected();
          
          showSuccessAlert(showAlert, `${count} performans kaydı silindi!`);
        } catch (error) {
          console.error('Toplu silme hatası:', error);
          showErrorAlert(showAlert, "Performans kayıtları silinirken bir hata oluştu");
        }
      }
    );
  };

  // Egzersizi sil
  const handleDeleteExercise = async () => {
    if (!exercise || !program || !day) return;

    showConfirmAlert(
      showAlert,
      "Egzersizi Sil",
      `"${exercise.name}" egzersizini silmek istediğinize emin misiniz?`,
      async () => {
        try {
          await StorageService.deleteExercise(program.id, day.id, exercise.id);
          showSuccessAlert(showAlert, "Egzersiz silindi!");
          router.back();
        } catch (error) {
          console.error('Egzersiz silme hatası:', error);
          showErrorAlert(showAlert, "Egzersiz silinirken bir hata oluştu");
        }
      }
    );
  };

  // Hata durumu
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: theme.colors.danger, fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            {error}
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
            onPress={actions.loadBasicExerciseData}
          >
            <Text style={{ color: theme.colors.primaryOn, fontSize: 16, fontWeight: 'bold' }}>
              Tekrar Dene
            </Text>
          </TouchableOpacity>
        </View>
        <AlertComponent />
      </SafeAreaView>
    );
  }

  // Loading durumu
  if (loading || !exercise || !program || !day) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style="light" />
        <LoadingStates 
          loading={loading}
          data={[exercise, program, day]}
          errorMessage="Egzersiz bulunamadı"
          loadingMessage="Egzersiz yükleniyor..."
          showSkeleton={true}
        />
        <AlertComponent />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.colors.background }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <DetailHeader
        title="Exercise Details"
        selectionMode={selectionMode}
        selectedCount={selectedPerformances.size}
        onCancelSelection={handleCancelSelection}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Exercise Card */}
      <ExerciseCard exercise={exercise} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Performance Charts */}
        <View style={{ marginTop: 16 }}>
          <PerformanceCharts performanceHistory={performanceHistory} />
        </View>
        
        {/* Performance History */}
        <View style={{ marginTop: 11 }}>
          <PerformanceHistory
            performanceHistory={performanceHistory}
            showAllHistory={showAllHistory}
            selectionMode={selectionMode}
            selectedPerformances={selectedPerformances}
            onShowAllHistoryToggle={actions.toggleShowAllHistory}
            onPerformancePress={handlePerformancePress}
            onPerformanceLongPress={handleLongPress}
            onShowNote={handleShowNote}
            onDeletePerformance={handleDeletePerformance}
          />
        </View>
      </ScrollView>

      {/* Performans Detay Modal */}
      <PerformanceDetailModal
        visible={performanceDetailModal.visible}
        performance={performanceDetailModal.performance}
        onClose={() => actions.toggleDetailModal(false)}
        onSave={handleSavePerformance}
        editSetModal={uiState.editSetModal}
        onToggleEditSetModal={actions.toggleEditSetModal}
        onUpdateEditSetFields={actions.updateEditSetFields}
      />

      {/* Not Görüntüleme Modali */}
      <NoteModal
        visible={noteModal.visible}
        note={noteModal.note}
        onClose={handleCloseNoteModal}
      />

      {/* Custom Alert */}
      <AlertComponent />
    </KeyboardAvoidingView>
  );
}


