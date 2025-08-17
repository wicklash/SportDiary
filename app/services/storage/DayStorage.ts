import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import { Day, Program } from '../../types';

export class DayStorage {
  
  /**
   * Belirli bir programa gün ekle
   */
  static async addDay(programId: string, day: Omit<Day, 'id'>): Promise<Day> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) throw new Error('Programlar bulunamadı');
      
      const programList: Program[] = JSON.parse(programs);
      const programIndex = programList.findIndex(p => p.id === programId);
      
      if (programIndex === -1) {
        throw new Error('Program bulunamadı');
      }

      const newDay: Day = {
        ...day,
        id: Date.now().toString(),
      };

      programList[programIndex].days.push(newDay);
      programList[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programList));
      return newDay;
    } catch (error) {
      console.error('Gün ekleme hatası:', error);
      throw new Error('Gün eklenemedi');
    }
  }

  /**
   * Gün güncelle
   */
  static async updateDay(programId: string, dayId: string, updates: Partial<Day>): Promise<Day> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) throw new Error('Programlar bulunamadı');
      
      const programList: Program[] = JSON.parse(programs);
      const programIndex = programList.findIndex(p => p.id === programId);
      
      if (programIndex === -1) {
        throw new Error('Program bulunamadı');
      }

      const dayIndex = programList[programIndex].days.findIndex(d => d.id === dayId);
      if (dayIndex === -1) {
        throw new Error('Gün bulunamadı');
      }

      const updatedDay = {
        ...programList[programIndex].days[dayIndex],
        ...updates,
      };

      programList[programIndex].days[dayIndex] = updatedDay;
      programList[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programList));
      return updatedDay;
    } catch (error) {
      console.error('Gün güncelleme hatası:', error);
      throw new Error('Gün güncellenemedi');
    }
  }

  /**
   * Gün sil
   */
  static async deleteDay(programId: string, dayId: string): Promise<void> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) throw new Error('Programlar bulunamadı');
      
      const programList: Program[] = JSON.parse(programs);
      const programIndex = programList.findIndex(p => p.id === programId);
      
      if (programIndex === -1) {
        throw new Error('Program bulunamadı');
      }

      programList[programIndex].days = programList[programIndex].days.filter(d => d.id !== dayId);
      programList[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programList));
    } catch (error) {
      console.error('Gün silme hatası:', error);
      throw new Error('Gün silinemedi');
    }
  }

  /**
   * Belirli bir gün getir
   */
  static async getDay(programId: string, dayId: string): Promise<Day | null> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) return null;
      
      const programList: Program[] = JSON.parse(programs);
      const program = programList.find(p => p.id === programId);
      
      if (!program) return null;
      
      return program.days.find(d => d.id === dayId) || null;
    } catch (error) {
      console.error('Gün getirme hatası:', error);
      return null;
    }
  }

  /**
   * Tüm günleri temizle (tüm programlardan)
   */
  static async clearAll(): Promise<void> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) return;
      
      const programList: Program[] = JSON.parse(programs);
      
      // Tüm programlardaki günleri temizle
      programList.forEach(program => {
        program.days = [];
        program.updatedAt = new Date().toISOString();
      });
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programList));
    } catch (error) {
      console.error('Günleri temizleme hatası:', error);
      throw new Error('Günler temizlenemedi');
    }
  }
}
