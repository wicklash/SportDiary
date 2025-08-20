import { Day, Program } from '../../types/index';
import { BaseStorage } from './BaseStorage';

export class DayStorage extends BaseStorage {
  
  /**
   * Belirli bir programa gün ekle
   */
  static async addDay(programId: string, day: Omit<Day, 'id'>): Promise<Day> {
    try {
      const programList: Program[] = await this.getPrograms();
      const programIndex = this.findProgramIndex(programList, programId);
      
      if (programIndex === -1) {
        this.throwError('Program bulunamadı');
      }

      const newDay: Day = {
        ...day,
        id: this.generateId(),
      };

      programList[programIndex].days.push(newDay);
      this.updateProgramTimestamp(programList[programIndex]);
      
      await this.savePrograms(programList);
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
      const programList: Program[] = await this.getPrograms();
      const programIndex = this.findProgramIndex(programList, programId);
      
      if (programIndex === -1) {
        this.throwError('Program bulunamadı');
      }

      const dayIndex = this.findDayIndex(programList[programIndex].days, dayId);
      if (dayIndex === -1) {
        this.throwError('Gün bulunamadı');
      }

      const updatedDay = {
        ...programList[programIndex].days[dayIndex],
        ...updates,
      };

      programList[programIndex].days[dayIndex] = updatedDay;
      this.updateProgramTimestamp(programList[programIndex]);
      
      await this.savePrograms(programList);
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
      const programList: Program[] = await this.getPrograms();
      const programIndex = this.findProgramIndex(programList, programId);
      
      if (programIndex === -1) {
        this.throwError('Program bulunamadı');
      }

      programList[programIndex].days = programList[programIndex].days.filter(d => d.id !== dayId);
      this.updateProgramTimestamp(programList[programIndex]);
      
      await this.savePrograms(programList);
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
      const programList: Program[] = await this.getPrograms();
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
      const programList: Program[] = await this.getPrograms();
      
      // Tüm programlardaki günleri temizle
      programList.forEach(program => {
        program.days = [];
        this.updateProgramTimestamp(program);
      });
      
      await this.savePrograms(programList);
    } catch (error) {
      console.error('Günleri temizleme hatası:', error);
      throw new Error('Günler temizlenemedi');
    }
  }
}

// Default export to prevent Expo Router from treating this as a route
export default DayStorage;
