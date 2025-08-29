import { useCallback, useReducer } from 'react';
import { PerformanceStorage, StorageService } from '../services/storage';
import { Day, Exercise, Performance, PerformanceSet, Program } from '../types';

// State tipleri
interface DataState {
  exercise: Exercise | null;
  program: Program | null;
  day: Day | null;
  loading: boolean;
  error: string | null;
}

interface UIState {
  noteModal: {
    visible: boolean;
    note: string;
  };
  performanceDetailModal: {
    visible: boolean;
    performance: Performance | null;
  };
  editSetModal: {
    visible: boolean;
    set: PerformanceSet | null;
    index: number;
    editReps: string;
    editWeight: string;
  };
  selectionMode: boolean;
  showAllHistory: boolean;
}

interface PerformanceState {
  history: Performance[];
  selectedPerformances: Set<string>;
}

// Action tipleri
type DataAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: { exercise: Exercise; program: Program; day: Day } }
  | { type: 'CLEAR_DATA' };

type UIAction = 
  | { type: 'TOGGLE_NOTE_MODAL'; payload: { visible: boolean; note?: string } }
  | { type: 'TOGGLE_DETAIL_MODAL'; payload: { visible: boolean; performance?: Performance } }
  | { type: 'TOGGLE_EDIT_SET_MODAL'; payload: { visible: boolean; set?: PerformanceSet; index?: number; editReps?: string; editWeight?: string } }
  | { type: 'UPDATE_EDIT_SET_FIELDS'; payload: { editReps?: string; editWeight?: string } }
  | { type: 'TOGGLE_SELECTION_MODE'; payload: boolean }
  | { type: 'TOGGLE_SHOW_ALL_HISTORY' }
  | { type: 'RESET_UI' };

type PerformanceAction = 
  | { type: 'SET_HISTORY'; payload: Performance[] }
  | { type: 'ADD_SELECTED'; payload: string }
  | { type: 'REMOVE_SELECTED'; payload: string }
  | { type: 'CLEAR_SELECTED' }
  | { type: 'SET_SELECTED'; payload: Set<string> };

// Reducer'lar
const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_DATA':
      return { 
        ...state, 
        exercise: action.payload.exercise,
        program: action.payload.program,
        day: action.payload.day,
        loading: false,
        error: null
      };
    case 'CLEAR_DATA':
      return { 
        exercise: null, 
        program: null, 
        day: null, 
        loading: false, 
        error: null 
      };
    default:
      return state;
  }
};

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'TOGGLE_NOTE_MODAL':
      return {
        ...state,
        noteModal: {
          visible: action.payload.visible,
          note: action.payload.note || state.noteModal.note
        }
      };
    case 'TOGGLE_DETAIL_MODAL':
      return {
        ...state,
        performanceDetailModal: {
          visible: action.payload.visible,
          performance: action.payload.performance || null
        }
      };
    case 'TOGGLE_EDIT_SET_MODAL':
      return {
        ...state,
        editSetModal: {
          visible: action.payload.visible,
          set: action.payload.set || state.editSetModal.set,
          index: action.payload.index ?? state.editSetModal.index,
          editReps: action.payload.editReps || state.editSetModal.editReps,
          editWeight: action.payload.editWeight || state.editSetModal.editWeight
        }
      };
    case 'UPDATE_EDIT_SET_FIELDS':
      return {
        ...state,
        editSetModal: {
          ...state.editSetModal,
          editReps: action.payload.editReps ?? state.editSetModal.editReps,
          editWeight: action.payload.editWeight ?? state.editSetModal.editWeight
        }
      };
    case 'TOGGLE_SELECTION_MODE':
      return { ...state, selectionMode: action.payload };
    case 'TOGGLE_SHOW_ALL_HISTORY':
      return { ...state, showAllHistory: !state.showAllHistory };
    case 'RESET_UI':
      return {
        noteModal: { visible: false, note: '' },
        performanceDetailModal: { visible: false, performance: null },
        editSetModal: { visible: false, set: null, index: -1, editReps: '', editWeight: '' },
        selectionMode: false,
        showAllHistory: false
      };
    default:
      return state;
  }
};

const performanceReducer = (state: PerformanceState, action: PerformanceAction): PerformanceState => {
  switch (action.type) {
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    case 'ADD_SELECTED':
      const newSelected = new Set(state.selectedPerformances);
      newSelected.add(action.payload);
      return { ...state, selectedPerformances: newSelected };
    case 'REMOVE_SELECTED':
      const updatedSelected = new Set(state.selectedPerformances);
      updatedSelected.delete(action.payload);
      return { ...state, selectedPerformances: updatedSelected };
    case 'CLEAR_SELECTED':
      return { ...state, selectedPerformances: new Set() };
    case 'SET_SELECTED':
      return { ...state, selectedPerformances: action.payload };
    default:
      return state;
  }
};

// Ana hook
export const useExerciseState = (id: string, dayId: string, programId: string) => {
  // State'leri reducer'larla yönet
  const [dataState, dispatchData] = useReducer(dataReducer, {
    exercise: null,
    program: null,
    day: null,
    loading: true,
    error: null
  });

  const [uiState, dispatchUI] = useReducer(uiReducer, {
    noteModal: { visible: false, note: '' },
    performanceDetailModal: { visible: false, performance: null },
    editSetModal: { visible: false, set: null, index: -1, editReps: '', editWeight: '' },
    selectionMode: false,
    showAllHistory: false
  });

  const [performanceState, dispatchPerformance] = useReducer(performanceReducer, {
    history: [],
    selectedPerformances: new Set<string>()
  });

  // Veri yükleme fonksiyonları
  const loadBasicExerciseData = useCallback(async () => {
    try {
      dispatchData({ type: 'SET_LOADING', payload: true });
      dispatchData({ type: 'SET_ERROR', payload: null });
      
      const programData = await StorageService.getProgram(programId);
      const dayData = programData?.days.find(d => d.id === dayId);
      const exerciseData = dayData?.exercises.find(e => e.id === id);
      
      if (exerciseData && programData && dayData) {
        dispatchData({ 
          type: 'SET_DATA', 
          payload: { exercise: exerciseData, program: programData, day: dayData } 
        });
        
        // Performans geçmişini arka planda yükle
        loadPerformanceHistoryInBackground(exerciseData.name);
      } else {
        dispatchData({ type: 'SET_ERROR', payload: 'Egzersiz bulunamadı' });
      }
    } catch (error) {
      console.error('Temel egzersiz verisi yüklenirken hata:', error);
      dispatchData({ type: 'SET_ERROR', payload: 'Egzersiz verisi yüklenirken bir hata oluştu' });
    } finally {
      dispatchData({ type: 'SET_LOADING', payload: false });
    }
  }, [id, dayId, programId]);

  const loadPerformanceHistoryInBackground = useCallback(async (exerciseName: string) => {
    try {
      const history = await PerformanceStorage.getExercisePerformances(exerciseName);
      dispatchPerformance({ type: 'SET_HISTORY', payload: history });
    } catch (error) {
      console.error('Performans geçmişi yüklenirken hata:', error);
      dispatchPerformance({ type: 'SET_HISTORY', payload: [] });
    }
  }, []);

  const loadPerformanceHistory = useCallback(async (exerciseName: string) => {
    try {
      const history = await PerformanceStorage.getExercisePerformances(exerciseName);
      dispatchPerformance({ type: 'SET_HISTORY', payload: history });
    } catch (error) {
      console.error('Performans geçmişi yüklenirken hata:', error);
    }
  }, []);

  // UI action'ları
  const toggleNoteModal = useCallback((visible: boolean, note?: string) => {
    dispatchUI({ type: 'TOGGLE_NOTE_MODAL', payload: { visible, note } });
  }, []);

  const toggleDetailModal = useCallback((visible: boolean, performance?: Performance) => {
    dispatchUI({ type: 'TOGGLE_DETAIL_MODAL', payload: { visible, performance } });
  }, []);

  const toggleEditSetModal = useCallback((visible: boolean, set?: PerformanceSet, index?: number, editReps?: string, editWeight?: string) => {
    dispatchUI({ type: 'TOGGLE_EDIT_SET_MODAL', payload: { visible, set, index, editReps, editWeight } });
  }, []);

  const updateEditSetFields = useCallback((editReps?: string, editWeight?: string) => {
    dispatchUI({ type: 'UPDATE_EDIT_SET_FIELDS', payload: { editReps, editWeight } });
  }, []);

  const toggleSelectionMode = useCallback((enabled: boolean) => {
    dispatchUI({ type: 'TOGGLE_SELECTION_MODE', payload: enabled });
    if (!enabled) {
      dispatchPerformance({ type: 'CLEAR_SELECTED' });
    }
  }, []);

  const toggleShowAllHistory = useCallback(() => {
    dispatchUI({ type: 'TOGGLE_SHOW_ALL_HISTORY' });
  }, []);

  // Performans action'ları
  const addSelectedPerformance = useCallback((performanceId: string) => {
    dispatchPerformance({ type: 'ADD_SELECTED', payload: performanceId });
  }, []);

  const removeSelectedPerformance = useCallback((performanceId: string) => {
    dispatchPerformance({ type: 'REMOVE_SELECTED', payload: performanceId });
  }, []);

  const setSelectedPerformances = useCallback((selected: Set<string>) => {
    dispatchPerformance({ type: 'SET_SELECTED', payload: selected });
  }, []);

  const clearSelected = useCallback(() => {
    dispatchPerformance({ type: 'CLEAR_SELECTED' });
  }, []);

  // Performans güncelleme
  const updatePerformanceHistory = useCallback(async (exerciseName: string) => {
    await loadPerformanceHistory(exerciseName);
  }, [loadPerformanceHistory]);

  // Reset fonksiyonu
  const resetState = useCallback(() => {
    dispatchData({ type: 'CLEAR_DATA' });
    dispatchUI({ type: 'RESET_UI' });
    dispatchPerformance({ type: 'CLEAR_SELECTED' });
  }, []);

  return {
    // State'ler
    dataState,
    uiState,
    performanceState,
    
    // Actions
    actions: {
      // Veri yükleme
      loadBasicExerciseData,
      loadPerformanceHistory,
      updatePerformanceHistory,
      
      // UI kontrolü
      toggleNoteModal,
      toggleDetailModal,
      toggleEditSetModal,
      updateEditSetFields,
      toggleSelectionMode,
      toggleShowAllHistory,
      
      // Seçim yönetimi
      addSelectedPerformance,
      removeSelectedPerformance,
      setSelectedPerformances,
      clearSelected,
      
      // Reset
      resetState
    }
  };
};

// Default export ekle
export default useExerciseState;
