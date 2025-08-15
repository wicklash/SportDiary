import { SetsValue, RepsValue } from '../types';

/**
 * Sets değerini string formatında döndür
 */
export const formatSetsValue = (sets: SetsValue): string => {
  if (typeof sets === 'number') {
    return sets.toString();
  } else {
    return `${sets.min}-${sets.max}`;
  }
};

/**
 * Reps değerini string formatında döndür
 */
export const formatRepsValue = (reps: RepsValue): string => {
  if (typeof reps === 'number') {
    return reps.toString();
  } else {
    return `${reps.min}-${reps.max}`;
  }
};

/**
 * Tarihi formatla
 */
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Kısa tarih formatı
 */
export const formatDateShort = (date: string): string => {
  return new Date(date).toLocaleDateString('tr-TR', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Ağırlığı formatla
 */
export const formatWeight = (weight?: number): string => {
  return weight != null ? `${weight} kg` : '-';
};

/**
 * Süreyi formatla (dakika)
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} dk`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}s ${remainingMinutes}dk` : `${hours}s`;
  }
};
