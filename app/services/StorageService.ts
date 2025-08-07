import AsyncStorage from '@react-native-async-storage/async-storage';
import { Program, Day, Exercise, Performance, WorkoutSession, ProgramSummary } from '../types';

// Storage anahtarları
const STORAGE_KEYS = {
  PROGRAMS: '@sportdiary_programs',
  PERFORMANCES: '@sportdiary_performances',
  SESSIONS: '@sportdiary_sessions',
  SETTINGS: '@sportdiary_settings',
} as const;

export class StorageService {
  
  // ==================== PROGRAM İŞLEMLERİ ====================
  
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
      const programs = await this.getPrograms();
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
      const programs = await this.getPrograms();
      
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
      const programs = await this.getPrograms();
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
      const programs = await this.getPrograms();
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
      const programs = await this.getPrograms();
      return programs.find(p => p.id === programId) || null;
    } catch (error) {
      console.error('Program getirme hatası:', error);
      return null;
    }
  }

  // ==================== GÜN İŞLEMLERİ ====================

  /**
   * Programa gün ekle
   */
  static async addDayToProgram(programId: string, dayData: Omit<Day, 'id' | 'programId'>): Promise<Day> {
    try {
      const programs = await this.getPrograms();
      const programIndex = programs.findIndex(p => p.id === programId);
      
      if (programIndex === -1) {
        throw new Error('Program bulunamadı');
      }

      const newDay: Day = {
        ...dayData,
        id: Date.now().toString(),
        programId,
      };

      programs[programIndex].days.push(newDay);
      programs[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
      
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
      const programs = await this.getPrograms();
      const programIndex = programs.findIndex(p => p.id === programId);
      
      if (programIndex === -1) {
        throw new Error('Program bulunamadı');
      }

      const dayIndex = programs[programIndex].days.findIndex(d => d.id === dayId);
      
      if (dayIndex === -1) {
        throw new Error('Gün bulunamadı');
      }

      const updatedDay = {
        ...programs[programIndex].days[dayIndex],
        ...updates,
      };

      programs[programIndex].days[dayIndex] = updatedDay;
      programs[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
      
      return updatedDay;
    } catch (error) {
      console.error('Gün güncelleme hatası:', error);
      throw new Error('Gün güncellenemedi');
    }
  }

  // ==================== EGZERSİZ İŞLEMLERİ ====================

  /**
   * Güne egzersiz ekle
   */
  static async addExerciseToDay(programId: string, dayId: string, exerciseData: Omit<Exercise, 'id' | 'dayId'>): Promise<Exercise> {
    try {
      const programs = await this.getPrograms();
      const programIndex = programs.findIndex(p => p.id === programId);
      
      if (programIndex === -1) {
        throw new Error('Program bulunamadı');
      }

      const dayIndex = programs[programIndex].days.findIndex(d => d.id === dayId);
      
      if (dayIndex === -1) {
        throw new Error('Gün bulunamadı');
      }

      const newExercise: Exercise = {
        ...exerciseData,
        id: Date.now().toString(),
        dayId,
      };

      programs[programIndex].days[dayIndex].exercises.push(newExercise);
      programs[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
      
      return newExercise;
    } catch (error) {
      console.error('Egzersiz ekleme hatası:', error);
      throw new Error('Egzersiz eklenemedi');
    }
  }

  /**
   * Egzersiz sil
   */
  static async deleteExercise(programId: string, dayId: string, exerciseId: string): Promise<void> {
    try {
      const programs = await this.getPrograms();
      const programIndex = programs.findIndex(p => p.id === programId);
      
      if (programIndex === -1) {
        throw new Error('Program bulunamadı');
      }

      const dayIndex = programs[programIndex].days.findIndex(d => d.id === dayId);
      
      if (dayIndex === -1) {
        throw new Error('Gün bulunamadı');
      }

      const exerciseIndex = programs[programIndex].days[dayIndex].exercises.findIndex(e => e.id === exerciseId);
      
      if (exerciseIndex === -1) {
        throw new Error('Egzersiz bulunamadı');
      }

      programs[programIndex].days[dayIndex].exercises.splice(exerciseIndex, 1);
      programs[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    } catch (error) {
      console.error('Egzersiz silme hatası:', error);
      throw new Error('Egzersiz silinemedi');
    }
  }

  // ==================== PERFORMANS İŞLEMLERİ ====================

  /**
   * Performans kaydet
   */
  static async savePerformance(performance: Omit<Performance, 'id'>): Promise<Performance> {
    try {
      const performances = await this.getPerformances();
      
      const newPerformance: Performance = {
        ...performance,
        id: Date.now().toString(),
      };

      performances.push(newPerformance);
      await AsyncStorage.setItem(STORAGE_KEYS.PERFORMANCES, JSON.stringify(performances));
      
      return newPerformance;
    } catch (error) {
      console.error('Performans kaydetme hatası:', error);
      throw new Error('Performans kaydedilemedi');
    }
  }

  /**
   * Egzersiz için hızlı performans kaydet (current target values ile)
   */
  static async logExercisePerformance(exerciseId: string, programId: string, dayId: string): Promise<Performance> {
    try {
      // Egzersiz bilgilerini al
      const program = await this.getProgram(programId);
      const day = program?.days.find(d => d.id === dayId);
      const exercise = day?.exercises.find(e => e.id === exerciseId);
      
      if (!exercise) {
        throw new Error('Egzersiz bulunamadı');
      }

      // Target değerlerini kullanarak performans oluştur
      const sets: PerformanceSet[] = [];
      const targetSetsNum = typeof exercise.targetSets === 'number' 
        ? exercise.targetSets 
        : exercise.targetSets.min; // Aralık ise minimum değeri al
      
      const targetRepsNum = typeof exercise.targetReps === 'number'
        ? exercise.targetReps
        : exercise.targetReps.min; // Aralık ise minimum değeri al

      for (let i = 1; i <= targetSetsNum; i++) {
        sets.push({
          setNumber: i,
          reps: targetRepsNum,
          weight: exercise.targetWeight,
          completed: true,
        });
      }

      const newPerformance: Performance = {
        id: Date.now().toString(),
        exerciseId: exerciseId,
        date: new Date().toISOString(),
        sets: sets,
        notes: undefined,
      };

      // Performansı kaydet
      const performances = await this.getPerformances();
      performances.push(newPerformance);
      await AsyncStorage.setItem(STORAGE_KEYS.PERFORMANCES, JSON.stringify(performances));

      // Exercise'ın lastPerformance'ını güncelle
      const updatedExercise = {
        ...exercise,
        lastPerformance: newPerformance,
      };

      const updatedDay = {
        ...day,
        exercises: day.exercises.map(ex => 
          ex.id === exerciseId ? updatedExercise : ex
        )
      };

      const updatedProgram = {
        ...program,
        days: program.days.map(d => 
          d.id === dayId ? updatedDay : d
        )
      };

      await this.updateProgram(programId, updatedProgram);
      
      return newPerformance;
    } catch (error) {
      console.error('Egzersiz performans kaydetme hatası:', error);
      throw new Error('Egzersiz performansı kaydedilemedi');
    }
  }

  /**
   * Tüm performansları getir
   */
  static async getPerformances(): Promise<Performance[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PERFORMANCES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Performanslar getirme hatası:', error);
      return [];
    }
  }

  /**
   * Belirli egzersiz için performans geçmişi
   */
  static async getExerciseHistory(exerciseId: string): Promise<Performance[]> {
    try {
      const performances = await this.getPerformances();
      return performances
        .filter(p => p.exerciseId === exerciseId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Egzersiz geçmişi getirme hatası:', error);
      return [];
    }
  }

  // ==================== YARDIMCI İŞLEMLER ====================

  /**
   * Tüm verileri temizle (test için)
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Veri temizleme hatası:', error);
      throw new Error('Veriler temizlenemedi');
    }
  }

  /**
   * Veri boyutunu hesapla
   */
  static async getDataSize(): Promise<{ [key: string]: number }> {
    try {
      const sizes: { [key: string]: number } = {};
      
      for (const [name, key] of Object.entries(STORAGE_KEYS)) {
        const data = await AsyncStorage.getItem(key);
        sizes[name] = data ? JSON.stringify(data).length : 0;
      }
      
      return sizes;
    } catch (error) {
      console.error('Veri boyutu hesaplama hatası:', error);
      return {};
    }
  }
}

export default StorageService;