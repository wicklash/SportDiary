import AsyncStorage from '@react-native-async-storage/async-storage';
import { Program, ProgramSummary } from '../../types';
import { STORAGE_KEYS } from '../../constants/storage-keys';

export class ProgramStorage {
  
  /**
   * Tüm programları getir
   */
  static async getPrograms(): Promise<Program[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Programs getirme hatası:', error);
      return [];
    }
  }

  /**
   * Program özet listesini getir (performans için)
   */
  static async getProgramSummaries(): Promise<ProgramSummary[]> {
    try {
      const programs = await ProgramStorage.getPrograms();
      return programs.map(program => ({
        id: program.id,
        name: program.name,
        description: program.description,
        dayCount: program.days.length,
        totalExercises: program.days.reduce((total, day) => total + day.exercises.length, 0),
        createdAt: program.createdAt,
      }));
    } catch (error) {
      console.error('Program summaries getirme hatası:', error);
      return [];
    }
  }

  /**
   * Yeni program kaydet
   */
  static async saveProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program> {
    try {
      const programs = await ProgramStorage.getPrograms();
      
      const newProgram: Program = {
        ...program,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      programs.push(newProgram);
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
      
      return newProgram;
    } catch (error) {
      console.error('Program kaydetme hatası:', error);
      throw new Error('Program kaydedilemedi');
    }
  }

  /**
   * Program güncelle
   */
  static async updateProgram(programId: string, updates: Partial<Program>): Promise<Program> {
    try {
      const programs = await ProgramStorage.getPrograms();
      const programIndex = programs.findIndex(p => p.id === programId);
      
      if (programIndex === -1) {
        throw new Error('Program bulunamadı');
      }

      const updatedProgram = {
        ...programs[programIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      programs[programIndex] = updatedProgram;
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
      
      return updatedProgram;
    } catch (error) {
      console.error('Program güncelleme hatası:', error);
      throw new Error('Program güncellenemedi');
    }
  }

  /**
   * Program sil
   */
  static async deleteProgram(programId: string): Promise<void> {
    try {
      const programs = await ProgramStorage.getPrograms();
      const filteredPrograms = programs.filter(p => p.id !== programId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(filteredPrograms));
    } catch (error) {
      console.error('Program silme hatası:', error);
      throw new Error('Program silinemedi');
    }
  }

  /**
   * Belirli bir program getir
   */
  static async getProgram(programId: string): Promise<Program | null> {
    try {
      const programs = await ProgramStorage.getPrograms();
      return programs.find(p => p.id === programId) || null;
    } catch (error) {
      console.error('Program getirme hatası:', error);
      return null;
    }
  }
}
