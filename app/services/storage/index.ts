// Barrel export for storage services
export { BaseStorage } from './BaseStorage';
export { DayStorage } from './DayStorage';
export { ExerciseStorage } from './ExerciseStorage';
export { PerformanceStorage } from './PerformanceStorage';
export { ProgramStorage } from './ProgramStorage';

// Legacy compatibility - Re-export as StorageService for existing code
import { DayStorage } from './DayStorage';
import { ExerciseStorage } from './ExerciseStorage';
import { PerformanceStorage } from './PerformanceStorage';
import { ProgramStorage } from './ProgramStorage';

export const StorageService = {
  // Program operations
  getPrograms: async () => ProgramStorage.getPrograms(),
  getProgramSummaries: async () => ProgramStorage.getProgramSummaries(),
  saveProgram: async (data: any) => ProgramStorage.saveProgram(data),
  updateProgram: async (id: string, updates: any) => ProgramStorage.updateProgram(id, updates),
  deleteProgram: async (id: string) => ProgramStorage.deleteProgram(id),
  getProgram: async (id: string) => ProgramStorage.getProgram(id),
  
  // Day operations
  addDayToProgram: async (programId: string, day: any) => DayStorage.addDay(programId, day),
  updateDay: async (programId: string, dayId: string, updates: any) => DayStorage.updateDay(programId, dayId, updates),
  deleteDay: async (programId: string, dayId: string) => DayStorage.deleteDay(programId, dayId),
  
  // Exercise operations  
  addExerciseToDay: async (programId: string, dayId: string, exercise: any) => ExerciseStorage.addExercise(programId, dayId, exercise),
  deleteExercise: async (programId: string, dayId: string, exerciseId: string) => ExerciseStorage.deleteExercise(programId, dayId, exerciseId),
  updateExercise: async (programId: string, dayId: string, exerciseId: string, updates: any) => ExerciseStorage.updateExercise(programId, dayId, exerciseId, updates),
  
  // Performance operations
  savePerformance: async (data: any) => PerformanceStorage.addPerformance(data),
  getExercisePerformancesByName: async (exerciseName: string) => PerformanceStorage.getExercisePerformances(exerciseName),
  
  // Exercise search operations
  findExercisesByName: async (exerciseName: string) => ExerciseStorage.findExercisesByName(exerciseName),
};
