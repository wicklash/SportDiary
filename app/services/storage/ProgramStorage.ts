import { Program, ProgramSummary } from '../../types';
import { BaseStorage } from './BaseStorage';

export class ProgramStorage extends BaseStorage {
  
  /**
   * Tüm programları getir
   */
  static async getPrograms(): Promise<Program[]> {
    try {
      return await this.getItem('@sportdiary_programs') || [];
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
      const programs = await this.getPrograms();
      
      const newProgram: Program = {
        ...program,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      programs.push(newProgram);
      await this.savePrograms(programs);
      
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
      const programIndex = this.findProgramIndex(programs, programId);
      
      if (programIndex === -1) {
        this.throwError('Program bulunamadı');
      }

      const updatedProgram = {
        ...programs[programIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      programs[programIndex] = updatedProgram;
      await this.savePrograms(programs);
      
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
      await this.savePrograms(filteredPrograms);
    } catch (error) {
      console.error('Program silme hatası:', error);
      throw new Error('Program silinemedi');
    }
  }

  /**
   * Tüm programları temizle
   */
  static async clearAll(): Promise<void> {
    try {
      await this.removeItem('@sportdiary_programs');
    } catch (error) {
      console.error('Programları temizleme hatası:', error);
      throw new Error('Programlar temizlenemedi');
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
}
