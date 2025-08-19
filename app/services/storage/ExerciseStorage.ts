import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import { Day, Exercise, Program } from '../../types';

// Result pattern için interface
interface ExerciseResult {
  success: boolean;
  data?: Exercise;
  error?: string;
}

export class ExerciseStorage {
  
  /**
   * Güne egzersiz ekle - Egzersiz adı bazında benzersizlik kontrolü
   */
  static async addExercise(programId: string, dayId: string, exercise: Omit<Exercise, 'id'>): Promise<ExerciseResult> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) {
        return { success: false, error: 'Programlar bulunamadı' };
      }
      
      const programList: Program[] = JSON.parse(programs);
      const programIndex = programList.findIndex(p => p.id === programId);
      if (programIndex === -1) {
        return { success: false, error: 'Program bulunamadı' };
      }
      
      const dayIndex = programList[programIndex].days.findIndex(d => d.id === dayId);
      if (dayIndex === -1) {
        return { success: false, error: 'Gün bulunamadı' };
      }
      
      // Aynı günde aynı isimde egzersiz var mı kontrol et
      const existingExercise = programList[programIndex].days[dayIndex].exercises
        .find(e => {
          if (!e.name || !exercise.name || 
              typeof e.name !== 'string' || typeof exercise.name !== 'string') {
            return false;
          }
          try {
            return e.name.toLowerCase().trim() === exercise.name.toLowerCase().trim();
          } catch (error) {
            return false;
          }
        });
      
      if (existingExercise) {
        return { success: false, error: `"${exercise.name}" egzersizi bu günde zaten mevcut` };
      }
      
      const newExercise: Exercise = {
        ...exercise,
        id: Date.now().toString(),
      };
      
      programList[programIndex].days[dayIndex].exercises.push(newExercise);
      programList[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programList));
      return { success: true, data: newExercise };
    } catch (error) {
      return { success: false, error: 'Egzersiz eklenirken bir hata oluştu' };
    }
  }

  /**
   * Egzersiz güncelle - Egzersiz adı değiştirirken benzersizlik kontrolü
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
      
      // Eğer egzersiz adı değiştiriliyor ve aynı günde başka bir egzersizde aynı isim varsa hata ver
      if (updates.name && typeof updates.name === 'string') {
        const existingExercise = programList[programIndex].days[dayIndex].exercises
          .find((e, index) => {
            if (index === exerciseIndex) return false;
            if (!e.name || !updates.name || 
                typeof e.name !== 'string' || typeof updates.name !== 'string') {
              return false;
            }
            try {
              return e.name.toLowerCase().trim() === updates.name.toLowerCase().trim();
            } catch (error) {
              return false;
            }
          });
        
        if (existingExercise) {
          throw new Error(`"${updates.name}" egzersizi bu günde zaten mevcut`);
        }
      }
      
      const updatedExercise = {
        ...programList[programIndex].days[dayIndex].exercises[exerciseIndex],
        ...updates,
      };
      
      programList[programIndex].days[dayIndex].exercises[exerciseIndex] = updatedExercise;
      programList[programIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programList));
      return updatedExercise;
    } catch (error) {
      // console.error kaldırıldı - default uyarı mesajı gösterilmesin
      throw error; // Orijinal hata mesajını koru
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
      // console.error kaldırıldı - default uyarı mesajı gösterilmesin
      throw new Error('Egzersiz silinemedi');
    }
  }

  /**
   * Belirli bir egzersiz getir (ID ile)
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
      return null;
    }
  }

  /**
   * Tüm egzersizleri temizle (tüm programlardaki tüm günlerden)
   */
  static async clearAll(): Promise<void> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) return;
      
      const programList: Program[] = JSON.parse(programs);
      
      // Tüm programlardaki tüm günlerdeki egzersizleri temizle
      programList.forEach(program => {
        program.days.forEach(day => {
          day.exercises = [];
        });
        program.updatedAt = new Date().toISOString();
      });
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programList));
    } catch (error) {
      // console.error kaldırıldı - default uyarı mesajı gösterilmesin
      throw new Error('Egzersizler temizlenemedi');
    }
  }

  /**
   * Tüm programlarda belirli isimde egzersizleri bul
   */
  static async findExercisesByName(exerciseName: string): Promise<Array<{exercise: Exercise, program: Program, day: Day}>> {
    try {
      const programs = await AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!programs) return [];
      
      const programList: Program[] = JSON.parse(programs);
      const results: Array<{exercise: Exercise, program: Program, day: Day}> = [];
      
      programList.forEach(program => {
        program.days.forEach(day => {
          day.exercises.forEach(exercise => {
            // Güvenli string kontrolü
            if (!exercise.name || !exerciseName || 
                typeof exercise.name !== 'string' || typeof exerciseName !== 'string') {
              return;
            }
            try {
              if (exercise.name.toLowerCase().trim() === exerciseName.toLowerCase().trim()) {
                results.push({ exercise, program, day });
              }
            } catch (error) {
              return;
            }
          });
        });
      });
      
      return results;
    } catch (error) {
      // console.error kaldırıldı - default uyarı mesajı gösterilmesin
      return [];
    }
  }
}
