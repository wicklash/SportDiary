import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import { Performance, PerformanceSet } from '../../types';

export class PerformanceStorage {
  
  /**
   * Tüm performans kayıtlarını getir
   */
  static async getPerformances(): Promise<Performance[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PERFORMANCES);
      if (!data) return [];
      
      const performances = JSON.parse(data);
      
      // Eski format kontrolü ve migration
      const migratedPerformances = performances.map((p: any) => {
        // Eğer eski formatta exerciseId varsa ve exerciseName yoksa, migration yap
        if (p.exerciseId && !p.exerciseName) {
          console.warn('Eski format performans verisi tespit edildi, migration gerekiyor:', p.id);
          return {
            ...p,
            exerciseName: typeof p.exerciseId === 'string' ? p.exerciseId : 'Bilinmeyen Egzersiz', // Güvenli migration
          };
        }
        // exerciseName'in string olduğundan emin ol
        if (p.exerciseName && typeof p.exerciseName !== 'string') {
          console.warn('Geçersiz exerciseName tipi tespit edildi:', typeof p.exerciseName, p.id);
          return {
            ...p,
            exerciseName: String(p.exerciseName), // String'e dönüştür
          };
        }
        return p;
      });
      
      return migratedPerformances;
    } catch (error) {
      console.error('Performans kayıtları getirme hatası:', error);
      return [];
    }
  }

  /**
   * Belirli bir egzersizin performans kayıtlarını getir (egzersiz adına göre)
   */
  static async getExercisePerformances(exerciseName: string): Promise<Performance[]> {
    try {
      if (!exerciseName || typeof exerciseName !== 'string') {
        console.warn('Geçersiz egzersiz adı:', exerciseName);
        return [];
      }
      
      const performances = await PerformanceStorage.getPerformances();
      const exercisePerformances = performances.filter(p => {
        // exerciseName'in varlığını ve tipini kontrol et
        if (!p.exerciseName || typeof p.exerciseName !== 'string' || p.exerciseName.trim() === '') {
          return false;
        }
        // Güvenli string karşılaştırması
        try {
          return p.exerciseName.toLowerCase().trim() === exerciseName.toLowerCase().trim();
        } catch (error) {
          console.warn('String karşılaştırma hatası:', error, 'exerciseName:', p.exerciseName);
          return false;
        }
      });
      
      // En yeni performans verisi en üstte olacak şekilde sırala (tarih azalan)
      return exercisePerformances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Egzersiz performansları getirme hatası:', error);
      return [];
    }
  }

  /**
   * Performans kaydı ekle
   */
  static async addPerformance(performanceData: Omit<Performance, 'id'>): Promise<Performance> {
    try {
      const performances = await PerformanceStorage.getPerformances();
      
      const newPerformance: Performance = {
        ...performanceData,
        id: Date.now().toString(),
      };

      performances.push(newPerformance);
      await AsyncStorage.setItem(STORAGE_KEYS.PERFORMANCES, JSON.stringify(performances));
      
      return newPerformance;
    } catch (error) {
      console.error('Performans ekleme hatası:', error);
      throw new Error('Performans kaydedilemedi');
    }
  }

  /**
   * Performans kaydını güncelle
   */
  static async updatePerformance(performanceId: string, updates: Partial<Performance>): Promise<Performance> {
    try {
      const performances = await PerformanceStorage.getPerformances();
      const performanceIndex = performances.findIndex(p => p.id === performanceId);
      
      if (performanceIndex === -1) {
        throw new Error('Performans kaydı bulunamadı');
      }

      const updatedPerformance = {
        ...performances[performanceIndex],
        ...updates,
      };

      performances[performanceIndex] = updatedPerformance;
      await AsyncStorage.setItem(STORAGE_KEYS.PERFORMANCES, JSON.stringify(performances));
      
      return updatedPerformance;
    } catch (error) {
      console.error('Performans güncelleme hatası:', error);
      throw new Error('Performans kaydı güncellenemedi');
    }
  }

  /**
   * Performans kaydını sil
   */
  static async deletePerformance(performanceId: string): Promise<void> {
    try {
      const performances = await PerformanceStorage.getPerformances();
      const filteredPerformances = performances.filter(p => p.id !== performanceId);
      await AsyncStorage.setItem(STORAGE_KEYS.PERFORMANCES, JSON.stringify(filteredPerformances));
    } catch (error) {
      console.error('Performans silme hatası:', error);
      throw new Error('Performans silinemedi');
    }
  }

  /**
   * Tüm performans kayıtlarını temizle
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PERFORMANCES);
    } catch (error) {
      console.error('Performans kayıtlarını temizleme hatası:', error);
      throw new Error('Performans kayıtları temizlenemedi');
    }
  }

  /**
   * Performans set'i güncelle
   */
  static async updatePerformanceSet(performanceId: string, setIndex: number, setData: PerformanceSet): Promise<Performance> {
    try {
      const performances = await PerformanceStorage.getPerformances();
      const performanceIndex = performances.findIndex(p => p.id === performanceId);
      
      if (performanceIndex === -1) {
        throw new Error('Performans kaydı bulunamadı');
      }

      if (setIndex >= performances[performanceIndex].sets.length) {
        throw new Error('Set indeksi geçersiz');
      }

      performances[performanceIndex].sets[setIndex] = setData;
      
      await AsyncStorage.setItem(STORAGE_KEYS.PERFORMANCES, JSON.stringify(performances));
      return performances[performanceIndex];
    } catch (error) {
      console.error('Performans set güncelleme hatası:', error);
      throw new Error('Set güncellenemedi');
    }
  }

  /**
   * Belirli bir egzersizin son performans kaydını getir (egzersiz adına göre)
   */
  static async getLatestPerformance(exerciseName: string): Promise<Performance | null> {
    try {
      const performances = await PerformanceStorage.getExercisePerformances(exerciseName);
      if (performances.length === 0) return null;
      
      // getExercisePerformances zaten sıralı döndürüyor, ilkini al
      return performances[0];
    } catch (error) {
      console.error('Son performans getirme hatası:', error);
      return null;
    }
  }
}
