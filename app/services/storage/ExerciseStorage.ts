import { Day, Exercise, Program } from '../../types';
import { BaseStorage } from './BaseStorage';

// Result pattern için interface
interface ExerciseResult {
  success: boolean;
  data?: Exercise;
  error?: string;
}

export class ExerciseStorage extends BaseStorage {
  
  /**
   * Güne egzersiz ekle - Egzersiz adı bazında benzersizlik kontrolü
   */
  static async addExercise(programId: string, dayId: string, exercise: Omit<Exercise, 'id'>): Promise<ExerciseResult> {
    try {
      const programList: Program[] = await this.getPrograms();
      const programIndex = this.findProgramIndex(programList, programId);
      if (programIndex === -1) {
        return { success: false, error: 'Program bulunamadı' };
      }
      
      const dayIndex = this.findDayIndex(programList[programIndex].days, dayId);
      if (dayIndex === -1) {
        return { success: false, error: 'Gün bulunamadı' };
      }
      
      // Aynı günde aynı isimde egzersiz var mı kontrol et
      const existingExercise = programList[programIndex].days[dayIndex].exercises
        .find(e => this.safeStringCompare(e.name, exercise.name));
      
      if (existingExercise) {
        return { success: false, error: `"${exercise.name}" egzersizi bu günde zaten mevcut` };
      }
      
      const newExercise: Exercise = {
        ...exercise,
        id: this.generateId(),
      };
      
      programList[programIndex].days[dayIndex].exercises.push(newExercise);
      this.updateProgramTimestamp(programList[programIndex]);
      
      await this.savePrograms(programList);
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
      const programList: Program[] = await this.getPrograms();
      const programIndex = this.findProgramIndex(programList, programId);
      if (programIndex === -1) this.throwError('Program bulunamadı');
      
      const dayIndex = this.findDayIndex(programList[programIndex].days, dayId);
      if (dayIndex === -1) this.throwError('Gün bulunamadı');
      
      const exerciseIndex = this.findExerciseIndex(programList[programIndex].days[dayIndex].exercises, exerciseId);
      if (exerciseIndex === -1) this.throwError('Egzersiz bulunamadı');
      
      // Eğer egzersiz adı değiştiriliyor ve aynı günde başka bir egzersizde aynı isim varsa hata ver
      if (updates.name && typeof updates.name === 'string') {
        const existingExercise = programList[programIndex].days[dayIndex].exercises
          .find((e, index) => {
            if (index === exerciseIndex) return false;
            return this.safeStringCompare(e.name, updates.name);
          });
        
        if (existingExercise) {
          this.throwError(`"${updates.name}" egzersizi bu günde zaten mevcut`);
        }
      }
      
      const updatedExercise = {
        ...programList[programIndex].days[dayIndex].exercises[exerciseIndex],
        ...updates,
      };
      
      programList[programIndex].days[dayIndex].exercises[exerciseIndex] = updatedExercise;
      this.updateProgramTimestamp(programList[programIndex]);
      
      await this.savePrograms(programList);
      return updatedExercise;
    } catch (error) {
      throw error; // Orijinal hata mesajını koru
    }
  }

  /**
   * Egzersiz sil
   */
  static async deleteExercise(programId: string, dayId: string, exerciseId: string): Promise<void> {
    try {
      const programList: Program[] = await this.getPrograms();
      const programIndex = this.findProgramIndex(programList, programId);
      if (programIndex === -1) this.throwError('Program bulunamadı');
      
      const dayIndex = this.findDayIndex(programList[programIndex].days, dayId);
      if (dayIndex === -1) this.throwError('Gün bulunamadı');
      
      programList[programIndex].days[dayIndex].exercises = 
        programList[programIndex].days[dayIndex].exercises.filter(e => e.id !== exerciseId);
      
      this.updateProgramTimestamp(programList[programIndex]);
      
      await this.savePrograms(programList);
    } catch (error) {
      this.throwError('Egzersiz silinemedi', error);
    }
  }

  /**
   * Belirli bir egzersiz getir (ID ile)
   */
  static async getExercise(programId: string, dayId: string, exerciseId: string): Promise<Exercise | null> {
    try {
      const programList: Program[] = await this.getPrograms();
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
      const programList: Program[] = await this.getPrograms();
      
      // Tüm programlardaki tüm günlerdeki egzersizleri temizle
      programList.forEach(program => {
        program.days.forEach(day => {
          day.exercises = [];
        });
        this.updateProgramTimestamp(program);
      });
      
      await this.savePrograms(programList);
    } catch (error) {
      this.throwError('Egzersizler temizlenemedi', error);
    }
  }

  /**
   * Tüm programlarda belirli isimde egzersizleri bul
   */
  static async findExercisesByName(exerciseName: string): Promise<Array<{exercise: Exercise, program: Program, day: Day}>> {
    try {
      const programList: Program[] = await this.getPrograms();
      const results: Array<{exercise: Exercise, program: Program, day: Day}> = [];
      
      programList.forEach(program => {
        program.days.forEach(day => {
          day.exercises.forEach(exercise => {
            if (this.safeStringCompare(exercise.name, exerciseName)) {
              results.push({ exercise, program, day });
            }
          });
        });
      });
      
      return results;
    } catch (error) {
      return [];
    }
  }
}
