import AsyncStorage from '@react-native-async-storage/async-storage';

// Basit cache mekanizması
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Tüm storage sınıfları için temel sınıf
 * Ortak metodları ve error handling'i sağlar
 */
export abstract class BaseStorage {
  
  /**
   * Cache'den veri getir
   */
  protected static getFromCache<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    cache.delete(key);
    return null;
  }

  /**
   * Cache'e veri kaydet
   */
  protected static setCache(key: string, data: any, ttl: number = 5000): void {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Cache'i temizle
   */
  protected static clearCache(key?: string): void {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }

  /**
   * AsyncStorage'dan veri getir
   */
  protected static async getItem<T>(key: string): Promise<T | null> {
    try {
      // Önce cache'den kontrol et
      const cached = this.getFromCache<T>(key);
      if (cached !== null) {
        return cached;
      }

      const item = await AsyncStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Cache'e kaydet (5 saniye TTL)
        this.setCache(key, parsed, 5000);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error(`AsyncStorage getItem hatası (${key}):`, error);
      return null;
    }
  }

  /**
   * AsyncStorage'a veri kaydet
   */
  protected static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      // Cache'i güncelle
      this.setCache(key, value, 5000);
    } catch (error) {
      console.error(`AsyncStorage setItem hatası (${key}):`, error);
      throw error;
    }
  }

  /**
   * AsyncStorage'dan veri sil
   */
  protected static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      // Cache'den de sil
      this.clearCache(key);
    } catch (error) {
      console.error(`AsyncStorage removeItem hatası (${key}):`, error);
      throw error;
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
   * ID oluştur
   */
  protected static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Hata fırlat
   */
  protected static throwError(message: string): never {
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
