import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, Program } from '../../types';
import { STORAGE_KEYS } from '../../constants/storage-keys';

export class ExerciseStorage {
  
  /**
   * Güne egzersiz ekle
   */
  static async addExercise(programId: string, dayId: string, exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) throw new Error('Programlar bulunamadı');
      
      const programList: Program[] = JSON.parse(programs);
      const programIndex = programList.findIndex(p => p.id === programId);
      if (programIndex === -1) throw new Error('Program bulunamadı');
      
      const dayIndex = programList[programIndex].days.findIndex(d => d.id === dayId);
      if (dayIndex === -1) throw new Error('Gün bulunamadı');
      
      const newExercise: Exercise = {
        ...exercise,
        id: Date.now().toString(),
      };
      
      programList[programIndex].days[dayIndex].exercises.push(newExercise);
      programList[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programList));
      return newExercise;
    } catch (error) {
      console.error('Egzersiz ekleme hatası:', error);
      throw new Error('Egzersiz eklenemedi');
    }
  }

  /**
   * Egzersiz güncelle
   */
  static async updateExercise(programId: string, dayId: string, exerciseId: string, updates: Partial<Exercise>): Promise<Exercise> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) throw new Error('Programlar bulunamadı');
      
      const programList: Program[] = JSON.parse(programs);
      const programIndex = programList.findIndex(p => p.id === programId);
      if (programIndex === -1) throw new Error('Program bulunamadı');
      
      const dayIndex = programList[programIndex].days.findIndex(d => d.id === dayId);
      if (dayIndex === -1) throw new Error('Gün bulunamadı');
      
      const exerciseIndex = programList[programIndex].days[dayIndex].exercises.findIndex(e => e.id === exerciseId);
      if (exerciseIndex === -1) throw new Error('Egzersiz bulunamadı');
      
      const updatedExercise = {
        ...programList[programIndex].days[dayIndex].exercises[exerciseIndex],
        ...updates,
      };
      
      programList[programIndex].days[dayIndex].exercises[exerciseIndex] = updatedExercise;
      programList[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programList));
      return updatedExercise;
    } catch (error) {
      console.error('Egzersiz güncelleme hatası:', error);
      throw new Error('Egzersiz güncellenemedi');
    }
  }

  /**
   * Egzersiz sil
   */
  static async deleteExercise(programId: string, dayId: string, exerciseId: string): Promise<void> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) throw new Error('Programlar bulunamadı');
      
      const programList: Program[] = JSON.parse(programs);
      const programIndex = programList.findIndex(p => p.id === programId);
      if (programIndex === -1) throw new Error('Program bulunamadı');
      
      const dayIndex = programList[programIndex].days.findIndex(d => d.id === dayId);
      if (dayIndex === -1) throw new Error('Gün bulunamadı');
      
      programList[programIndex].days[dayIndex].exercises = 
        programList[programIndex].days[dayIndex].exercises.filter(e => e.id !== exerciseId);
      
      programList[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programList));
    } catch (error) {
      console.error('Egzersiz silme hatası:', error);
      throw new Error('Egzersiz silinemedi');
    }
  }

  /**
   * Belirli bir egzersiz getir
   */
  static async getExercise(programId: string, dayId: string, exerciseId: string): Promise<Exercise | null> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) return null;
      
      const programList: Program[] = JSON.parse(programs);
      const program = programList.find(p => p.id === programId);
      if (!program) return null;
      
      const day = program.days.find(d => d.id === dayId);
      if (!day) return null;
      
      return day.exercises.find(e => e.id === exerciseId) || null;
    } catch (error) {
      console.error('Egzersiz getirme hatası:', error);
      return null;
    }
  }
}
