import { Performance, PerformanceSet } from '../../types/index';
import { BaseStorage } from './BaseStorage';

export class PerformanceStorage extends BaseStorage {
  
  /**
   * Tüm performans kayıtlarını getir
   */
  static async getPerformances(): Promise<Performance[]> {
    try {
      const performances = await this.getItem<Performance[]>('@sportdiary_performances');
      if (!performances || !Array.isArray(performances)) return [];
      
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
      
      const performances = await this.getPerformances();
      const exercisePerformances = performances.filter(p => 
        this.safeStringCompare(p.exerciseName, exerciseName)
      );
      
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
      const performances = await this.getPerformances();
      
      const newPerformance: Performance = {
        ...performanceData,
        id: this.generateId(),
      };

      performances.push(newPerformance);
      await this.savePerformances(performances);
      
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
      const performances = await this.getPerformances();
      const performanceIndex = performances.findIndex(p => p.id === performanceId);
      
      if (performanceIndex === -1) {
        this.throwError('Performans kaydı bulunamadı');
      }

      const updatedPerformance = {
        ...performances[performanceIndex],
        ...updates,
      };

      performances[performanceIndex] = updatedPerformance;
      await this.savePerformances(performances);
      
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
      const performances = await this.getPerformances();
      const filteredPerformances = performances.filter(p => p.id !== performanceId);
      await this.savePerformances(filteredPerformances);
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
      await this.removeItem('@sportdiary_performances');
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
      const performances = await this.getPerformances();
      const performanceIndex = performances.findIndex(p => p.id === performanceId);
      
      if (performanceIndex === -1) {
        this.throwError('Performans kaydı bulunamadı');
      }

      if (setIndex >= performances[performanceIndex].sets.length) {
        this.throwError('Set indeksi geçersiz');
      }

      performances[performanceIndex].sets[setIndex] = setData;
      
      await this.savePerformances(performances);
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
      const performances = await this.getExercisePerformances(exerciseName);
      if (performances.length === 0) return null;
      
      // getExercisePerformances zaten sıralı döndürüyor, ilkini al
      return performances[0];
    } catch (error) {
      console.error('Son performans getirme hatası:', error);
      return null;
    }
  }
}

// Default export to prevent Expo Router from treating this as a route
export default PerformanceStorage;
