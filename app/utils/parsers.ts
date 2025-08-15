import { SetsValue, RepsValue } from '../types';

/**
 * String değerini SetsValue'ya çevir
 */
export const parseSetsValue = (value: string): SetsValue => {
  if (value.includes('-')) {
    const [min, max] = value.split('-').map(v => parseInt(v.trim()));
    return { min, max };
  }
  return parseInt(value);
};

/**
 * String değerini RepsValue'ya çevir
 */
export const parseRepsValue = (value: string): RepsValue => {
  if (value.includes('-')) {
    const [min, max] = value.split('-').map(v => parseInt(v.trim()));
    return { min, max };
  }
  return parseInt(value);
};
