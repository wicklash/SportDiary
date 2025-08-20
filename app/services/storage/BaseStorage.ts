import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tüm storage sınıfları için temel sınıf
 * Ortak metodları ve error handling'i sağlar
 */
export abstract class BaseStorage {
  
  /**
   * AsyncStorage'dan veri getir ve parse et
   */
  protected static async getItem<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Storage getirme hatası (${key}):`, error);
      return null;
    }
  }

  /**
   * AsyncStorage'a veri kaydet
   */
  protected static async setItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage kaydetme hatası (${key}):`, error);
      throw new Error(`Veri kaydedilemedi: ${key}`);
    }
  }

  /**
   * AsyncStorage'dan veri sil
   */
  protected static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage silme hatası (${key}):`, error);
      throw new Error(`Veri silinemedi: ${key}`);
    }
  }

  /**
   * Program listesini getir
   */
  protected static async getPrograms(): Promise<any[]> {
    const data = await this.getItem<any[]>('@sportdiary_programs');
    return Array.isArray(data) ? data : [];
  }

  /**
   * Program listesini kaydet
   */
  protected static async savePrograms(programs: any[]): Promise<void> {
    await this.setItem('@sportdiary_programs', programs);
  }

  /**
   * Performans listesini getir
   */
  protected static async getPerformances(): Promise<any[]> {
    const data = await this.getItem<any[]>('@sportdiary_performances');
    return Array.isArray(data) ? data : [];
  }

  /**
   * Performans listesini kaydet
   */
  protected static async savePerformances(performances: any[]): Promise<void> {
    await this.setItem('@sportdiary_performances', performances);
  }

  /**
   * Program bul ve index'ini döndür
   */
  protected static findProgramIndex(programs: any[], programId: string): number {
    return programs.findIndex(p => p.id === programId);
  }

  /**
   * Gün bul ve index'ini döndür
   */
  protected static findDayIndex(days: any[], dayId: string): number {
    return days.findIndex(d => d.id === dayId);
  }

  /**
   * Egzersiz bul ve index'ini döndür
   */
  protected static findExerciseIndex(exercises: any[], exerciseId: string): number {
    return exercises.findIndex(e => e.id === exerciseId);
  }

  /**
   * Program güncelleme zamanını güncelle
   */
  protected static updateProgramTimestamp(program: any): void {
    program.updatedAt = new Date().toISOString();
  }

  /**
   * Yeni ID oluştur
   */
  protected static generateId(): string {
    return Date.now().toString();
  }

  /**
   * Hata fırlat
   */
  protected static throwError(message: string, originalError?: any): never {
    if (originalError) {
      console.error(`Storage hatası: ${message}`, originalError);
    }
    throw new Error(message);
  }

  /**
   * Güvenli string karşılaştırması yap
   */
  protected static safeStringCompare(str1: string | null | undefined, str2: string | null | undefined): boolean {
    if (!str1 || !str2 || typeof str1 !== 'string' || typeof str2 !== 'string') {
      return false;
    }
    
    try {
      return str1.toLowerCase().trim() === str2.toLowerCase().trim();
    } catch (error) {
      console.warn('String karşılaştırma hatası:', error);
      return false;
    }
  }
}

// Default export to prevent Expo Router from treating this as a route
export default BaseStorage;
