import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { PresetExercise, DayOfWeek } from '../types';
import {
  isFirebaseConfigured,
  subscribeToSchedule,
  saveScheduleToFirebase,
  loadScheduleFromFirebase,
} from '../services/firebase';

interface ScheduleContextType {
  fullSchedule: Record<DayOfWeek, PresetExercise[]>;
  setDaySchedule: (dayOfWeek: DayOfWeek, exercises: PresetExercise[]) => void;
  addExerciseToSchedule: (dayOfWeek: DayOfWeek, exercise: PresetExercise) => void;
  removeExerciseFromSchedule: (dayOfWeek: DayOfWeek, index: number) => void;
  getScheduleForDay: (dayOfWeek: DayOfWeek, defaultExercises: PresetExercise[]) => PresetExercise[];
  clearDaySchedule: (dayOfWeek: DayOfWeek) => void;
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
  const [fullSchedule, setFullSchedule] = useState<Record<DayOfWeek, PresetExercise[]>>(() => loadFromStorage());
  const firebaseConfigured = isFirebaseConfigured();

  // Load from Firebase on mount if configured
  useEffect(() => {
    if (!firebaseConfigured) return;

    loadScheduleFromFirebase().then((data) => {
      if (data) {
        setFullSchedule(data);
        saveToStorage(data);
      }
    });
  }, [firebaseConfigured]);

  // Subscribe to Firebase updates
  useEffect(() => {
    if (!firebaseConfigured) return;

    const unsubscribe = subscribeToSchedule((data) => {
      setFullSchedule(data);
      saveToStorage(data);
    });

    return () => unsubscribe();
  }, [firebaseConfigured]);

  // Save to Firebase
  useEffect(() => {
    if (!firebaseConfigured) return;
    saveScheduleToFirebase(fullSchedule);
  }, [fullSchedule, firebaseConfigured]);

  // Also save to localStorage as backup
  useEffect(() => {
    saveToStorage(fullSchedule);
  }, [fullSchedule]);

  const setDaySchedule = useCallback((dayOfWeek: DayOfWeek, exercises: PresetExercise[]) => {
    setFullSchedule((prev) => ({
      ...prev,
      [dayOfWeek]: exercises,
    }));
  }, []);

  const addExerciseToSchedule = useCallback((dayOfWeek: DayOfWeek, exercise: PresetExercise) => {
    setFullSchedule((prev) => ({
      ...prev,
      [dayOfWeek]: [...(prev[dayOfWeek] || []), exercise],
    }));
  }, []);

  const removeExerciseFromSchedule = useCallback((dayOfWeek: DayOfWeek, index: number) => {
    setFullSchedule((prev) => {
      const updated = { ...prev };
      updated[dayOfWeek] = updated[dayOfWeek].filter((_, i) => i !== index);
      return updated;
    });
  }, []);

  const clearDaySchedule = useCallback((dayOfWeek: DayOfWeek) => {
    setFullSchedule((prev) => ({
      ...prev,
      [dayOfWeek]: [],
    }));
  }, []);

  const getScheduleForDay = useCallback((dayOfWeek: DayOfWeek, defaultExercises: PresetExercise[]) => {
    // If the user has customized this day, use their custom schedule
    // Otherwise use the default schedule
    const custom = fullSchedule[dayOfWeek];
    if (custom !== undefined) {
      return custom;
    }
    return defaultExercises;
  }, [fullSchedule]);

  return (
    <ScheduleContext.Provider value={{
      fullSchedule,
      setDaySchedule,
      addExerciseToSchedule,
      removeExerciseFromSchedule,
      getScheduleForDay,
      clearDaySchedule,
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
