// Veri tipleri tanımlamaları

// Aralık değerleri için tip tanımlaması
export interface Range {
  min: number;
  max: number;
}

// Sets ve Reps için union tip (tek değer veya aralık)
export type SetsValue = number | Range;
export type RepsValue = number | Range;

export interface Program {
  id: string;
  name: string;
  description?: string;
  days: Day[];
  createdAt: string;
  updatedAt: string;
}

export interface Day {
  id: string;
  programId: string;
  name: string;
  exercises: Exercise[];
  order: number; // Gün sırası (1, 2, 3...)
}

export interface Exercise {
  id: string;
  dayId: string;
  name: string;
  targetSets: SetsValue;
  targetReps: RepsValue;
  targetWeight?: number;
  restTime?: number; // Dinlenme süresi (saniye)
  notes?: string;
  lastPerformance?: Performance;
}

export interface Performance {
  id: string;
  exerciseId: string;
  date: string;
  sets: PerformanceSet[];
  notes?: string;
}

export interface PerformanceSet {
  setNumber: number;
  reps: number;
  weight?: number;
  completed: boolean;
}

// Yardımcı tipler
export interface ProgramSummary {
  id: string;
  name: string;
  description?: string;
  dayCount: number;
  totalExercises: number;
  createdAt: string;
}

export interface WorkoutSession {
  id: string;
  programId: string;
  dayId: string;
  date: string;
  performances: Performance[];
  duration?: number; // dakika
  completed: boolean;
}

// Yardımcı fonksiyonlar
export const formatSetsValue = (value: SetsValue): string => {
  if (typeof value === 'number') {
    return value.toString();
  }
  return `${value.min}-${value.max}`;
};

export const formatRepsValue = (value: RepsValue): string => {
  if (typeof value === 'number') {
    return value.toString();
  }
  return `${value.min}-${value.max}`;
};

export const parseSetsValue = (value: string): SetsValue => {
  if (value.includes('-')) {
    const [min, max] = value.split('-').map(v => parseInt(v.trim()));
    return { min, max };
  }
  return parseInt(value);
};

export const parseRepsValue = (value: string): RepsValue => {
  if (value.includes('-')) {
    const [min, max] = value.split('-').map(v => parseInt(v.trim()));
    return { min, max };
  }
  return parseInt(value);
};