import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LoadingStates } from "../../components";
import DetailHeader from "../../components/DetailHeader";
import { showConfirmAlert, showErrorAlert, showSuccessAlert, useCustomAlert } from "../../hooks/useCustomAlert";
import { PerformanceStorage, StorageService } from "../../services/storage";
import { theme } from "../../theme/theme";
import { Day, Exercise, Performance, Program } from "../../types";
import { formatRepsValue, formatSetsValue } from "../../utils/formatters";
import { parseRepsValue, parseSetsValue } from "../../utils/parsers";
import ExerciseCard from "./ExerciseCard";
import ExerciseEditForm from "./ExerciseEditForm";
import NoteModal from "./NoteModal";
import PerformanceDetailModal from "./PerformanceDetailModal";
import PerformanceHistory from "./PerformanceHistory";

export default function ExerciseDetailScreen() {
  const { id, dayId, programId } = useLocalSearchParams<{ 
    id: string; 
    dayId: string; 
    programId: string; 
  }>();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [day, setDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<Performance[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPerformances, setSelectedPerformances] = useState<Set<string>>(new Set());
  const [performanceDetailModalVisible, setPerformanceDetailModalVisible] = useState(false);
  const [selectedPerformanceDetail, setSelectedPerformanceDetail] = useState<Performance | null>(null);
  const { showAlert, AlertComponent } = useCustomAlert();

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editTargetSets, setEditTargetSets] = useState("");
  const [editTargetReps, setEditTargetReps] = useState("");
  const [editTargetWeight, setEditTargetWeight] = useState("");

  const loadExerciseData = useCallback(async () => {
    try {
      setLoading(true);
      const programData = await StorageService.getProgram(programId as string);
      const dayData = programData?.days.find(d => d.id === dayId);
      const exerciseData = dayData?.exercises.find(e => e.id === id);
      
      setProgram(programData);
      setDay(dayData || null);
      setExercise(exerciseData || null);
      
      // Set edit form values
      if (exerciseData) {
        setEditName(exerciseData.name);
        setEditTargetSets(formatSetsValue(exerciseData.targetSets));
        setEditTargetReps(formatRepsValue(exerciseData.targetReps));
        setEditTargetWeight(exerciseData.targetWeight?.toString() || "");
      }

      // Performans geçmişini yükle (egzersiz adına göre)
      if (exerciseData) {
        const history = await PerformanceStorage.getExercisePerformances(exerciseData.name);
        setPerformanceHistory(history);
      }
    } catch (error) {
      console.error('Egzersiz verisi yüklenirken hata:', error);
      showErrorAlert(showAlert, 'Egzersiz verisi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [id, dayId, programId, showAlert]);

  // Sadece performans geçmişini yükle (hafif işlem) - egzersiz adına göre
  const loadPerformanceHistory = useCallback(async () => {
    if (exercise) {
      try {
        const history = await PerformanceStorage.getExercisePerformances(exercise.name);
        setPerformanceHistory(history);
      } catch (error) {
        console.error('Performans geçmişi yüklenirken hata:', error);
      }
    }
  }, [exercise]);

  // İlk yükleme
  useEffect(() => {
    if (id && dayId && programId) {
      loadExerciseData();
    }
  }, [id, dayId, programId, loadExerciseData]);

  // Sadece performans geçmişini güncelle (performance eklendiğinde/silindiğinde)
  useFocusEffect(
    useCallback(() => {
      if (exercise) {
        loadPerformanceHistory();
      }
    }, [exercise, loadPerformanceHistory])
  );

  const handleDeletePerformance = async (performanceId: string) => {
    showConfirmAlert(
      showAlert,
      "Performans Kaydını Sil",
      "Bu performans kaydını silmek istediğinize emin misiniz?",
      async () => {
        try {
          await PerformanceStorage.deletePerformance(performanceId);
          // Sadece performans listesini güncelle
          await loadPerformanceHistory();
          showSuccessAlert(showAlert, "Performans kaydı silindi!");
        } catch (error) {
          console.error('Performans silme hatası:', error);
          showErrorAlert(showAlert, "Performans kaydı silinirken bir hata oluştu");
        }
      }
    );
  };

  const handleShowNote = (note: string) => {
    setSelectedNote(note);
    setNoteModalVisible(true);
  };

  const handleCloseNoteModal = () => {
    setNoteModalVisible(false);
    setSelectedNote("");
  };

  const handleLongPress = (performanceId: string) => {
    setSelectionMode(true);
    setSelectedPerformances(new Set([performanceId]));
  };

  const handlePerformancePress = (performanceId: string) => {
    if (selectionMode) {
      setSelectedPerformances(prev => {
        const next = new Set(prev);
        if (next.has(performanceId)) {
          next.delete(performanceId);
        } else {
          next.add(performanceId);
        }
        
        // Seçim kalmadıysa seçim modundan çık
        if (next.size === 0) {
          setSelectionMode(false);
        }
        
        return next;
      });
    } else {
      // Normal mod: Performans detaylarını göster
      const performance = performanceHistory.find(p => p.id === performanceId);
      if (performance) {
        setSelectedPerformanceDetail(performance);
        setPerformanceDetailModalVisible(true);
      }
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedPerformances(new Set());
  };

  const handleSavePerformance = async (updatedPerformance: Performance) => {
    try {
      // Performans verisini güncelle
      await PerformanceStorage.updatePerformance(updatedPerformance.id, updatedPerformance);
      
      // Performans geçmişini yeniden yükle
      await loadPerformanceHistory();
      
      // Seçili performans detayını güncelle
      setSelectedPerformanceDetail(updatedPerformance);
      
      showSuccessAlert(showAlert, 'Performans başarıyla güncellendi');
    } catch (error) {
      console.error('Performans güncelleme hatası:', error);
      showErrorAlert(showAlert, 'Performans güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteSelected = async () => {
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
          
          // Sadece performans listesini güncelle
          await loadPerformanceHistory();
          
          // Seçim modundan çık
          setSelectionMode(false);
          setSelectedPerformances(new Set());
          showSuccessAlert(showAlert, `${count} performans kaydı silindi!`);
        } catch (error) {
          console.error('Toplu silme hatası:', error);
          showErrorAlert(showAlert, "Performans kayıtları silinirken bir hata oluştu");
        }
      }
    );
  };

  const handleSaveChanges = async () => {
    if (!exercise || !program || !day) return;

    if (!editName.trim()) {
      showErrorAlert(showAlert, "Lütfen egzersiz adını girin");
      return;
    }

    try {
      const updatedExercise = {
        ...exercise,
        name: editName.trim(),
        targetSets: parseSetsValue(editTargetSets),
        targetReps: parseRepsValue(editTargetReps),
        targetWeight: editTargetWeight ? parseInt(editTargetWeight) : undefined,
      };

      // Mevcut StorageService.updateExercise kullanarak güncelle
      await StorageService.updateExercise(program.id, day.id, exercise.id, updatedExercise);
      
      setExercise(updatedExercise);
      setEditing(false);
      
      showSuccessAlert(showAlert, "Egzersiz bilgileri güncellendi!");
    } catch (error) {
      console.error('Egzersiz güncelleme hatası:', error);
      showErrorAlert(showAlert, "Egzersiz güncellenirken bir hata oluştu");
    }
  };

  const handleDeleteExercise = async () => {
    if (!exercise || !program || !day) return;

    showConfirmAlert(
      showAlert,
      "Egzersizi Sil",
      `&quot;${exercise.name}&quot; egzersizini silmek istediğinize emin misiniz?`,
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

  if (loading || !exercise || !program || !day) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style="light" />
        <LoadingStates 
          loading={loading}
          data={[exercise, program, day]}
          errorMessage="Egzersiz bulunamadı"
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
        editing={editing}
        onToggleEditing={() => setEditing(!editing)}
      />

      {/* Exercise Card */}
      <ExerciseCard exercise={exercise} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {editing ? (
          /* Edit Form */
          <ExerciseEditForm
            editName={editName}
            editTargetSets={editTargetSets}
            editTargetReps={editTargetReps}
            editTargetWeight={editTargetWeight}
            onEditNameChange={setEditName}
            onEditTargetSetsChange={setEditTargetSets}
            onEditTargetRepsChange={setEditTargetReps}
            onEditTargetWeightChange={setEditTargetWeight}
            onSaveChanges={handleSaveChanges}
            onDeleteExercise={handleDeleteExercise}
          />
        ) : (
          /* Display Info */
          <PerformanceHistory
            performanceHistory={performanceHistory}
            showAllHistory={showAllHistory}
            selectionMode={selectionMode}
            selectedPerformances={selectedPerformances}
            onShowAllHistoryToggle={() => setShowAllHistory(prev => !prev)}
            onPerformancePress={handlePerformancePress}
            onPerformanceLongPress={handleLongPress}
            onShowNote={handleShowNote}
            onDeletePerformance={handleDeletePerformance}
          />
        )}
      </ScrollView>

      {/* Performans Detay Modal */}
      <PerformanceDetailModal
        visible={performanceDetailModalVisible}
        performance={selectedPerformanceDetail}
        onClose={() => setPerformanceDetailModalVisible(false)}
        onSave={handleSavePerformance}
      />

      {/* Not Görüntüleme Modali */}
      <NoteModal
        visible={noteModalVisible}
        note={selectedNote}
        onClose={handleCloseNoteModal}
      />

      {/* Custom Alert */}
      <AlertComponent />
    </KeyboardAvoidingView>
  );
}


