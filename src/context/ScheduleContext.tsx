import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { PresetExercise, DayOfWeek } from '../types';

interface ScheduleContextType {
  customExercises: Record<DayOfWeek, PresetExercise[]>;
  addExerciseToSchedule: (dayOfWeek: DayOfWeek, exercise: PresetExercise) => void;
  removeExerciseFromSchedule: (dayOfWeek: DayOfWeek, index: number) => void;
  getScheduleForDay: (dayOfWeek: DayOfWeek, defaultExercises: PresetExercise[]) => PresetExercise[];
}

const SCHEDULE_STORAGE_KEY = 'forge_gym_custom_schedule';

function loadFromStorage(): Record<DayOfWeek, PresetExercise[]> {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };
}

function saveToStorage(data: Record<DayOfWeek, PresetExercise[]>) {
  try {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [customExercises, setCustomExercises] = useState<Record<DayOfWeek, PresetExercise[]>>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(customExercises);
  }, [customExercises]);

  const addExerciseToSchedule = useCallback((dayOfWeek: DayOfWeek, exercise: PresetExercise) => {
    setCustomExercises((prev) => ({
      ...prev,
      [dayOfWeek]: [...(prev[dayOfWeek] || []), exercise],
    }));
  }, []);

  const removeExerciseFromSchedule = useCallback((dayOfWeek: DayOfWeek, index: number) => {
    setCustomExercises((prev) => {
      const updated = { ...prev };
      updated[dayOfWeek] = updated[dayOfWeek].filter((_, i) => i !== index);
      return updated;
    });
  }, []);

  const getScheduleForDay = useCallback((dayOfWeek: DayOfWeek, defaultExercises: PresetExercise[]) => {
    const custom = customExercises[dayOfWeek] || [];
    return [...defaultExercises, ...custom];
  }, [customExercises]);

  return (
    <ScheduleContext.Provider value={{
      customExercises,
      addExerciseToSchedule,
      removeExerciseFromSchedule,
      getScheduleForDay,
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextType {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}
