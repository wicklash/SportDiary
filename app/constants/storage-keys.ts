// Storage anahtarları
export const STORAGE_KEYS = {
  PROGRAMS: '@sportdiary_programs',
  PERFORMANCES: '@sportdiary_performances',
  SESSIONS: '@sportdiary_sessions',
  SETTINGS: '@sportdiary_settings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
