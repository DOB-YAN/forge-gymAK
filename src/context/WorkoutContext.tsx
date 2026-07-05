import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { WorkoutData, DayWorkout, UserId, ExerciseLog, SetRecord, ExercisePattern, DayOfWeek } from '../types';
import { isFirebaseConfigured, subscribeToWorkouts, saveWorkoutToFirebase as fbSave } from '../services/firebase';

const DAYS: DayOfWeek[] = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

function getDayOfWeekFromDateKey(dateKey: string): DayOfWeek {
  const date = new Date(dateKey + 'T12:00:00');
  return DAYS[date.getDay()];
}

interface WorkoutContextType {
  workoutData: WorkoutData;
  getDayWorkout: (userId: UserId, dateKey: string) => DayWorkout | undefined;
  addExercise: (userId: UserId, dateKey: string, exerciseName: string, pattern: ExercisePattern, numSets: number) => void;
  updateSet: (userId: UserId, dateKey: string, exerciseIndex: number, setIndex: number, weightKg: number, reps: number) => void;
  addSet: (userId: UserId, dateKey: string, exerciseIndex: number) => void;
  removeSet: (userId: UserId, dateKey: string, exerciseIndex: number, setIndex: number) => void;
  toggleCompleted: (userId: UserId, dateKey: string) => void;
  importData: (data: WorkoutData) => void;
  exportData: () => WorkoutData;
  clearAllData: () => void;
}

const STORAGE_KEY = 'forge_gym_workout_data';

function loadFromStorage(): WorkoutData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveToStorage(data: WorkoutData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workoutData, setWorkoutData] = useState<WorkoutData>(loadFromStorage);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const fbSaveRef = useRef(fbSave);

  useEffect(() => {
    saveToStorage(workoutData);
  }, [workoutData]);

  // Initialize Firebase sync
  useEffect(() => {
    const configured = isFirebaseConfigured();
    setFirebaseConfigured(configured);
    if (!configured) return;

    const unsubscribe = subscribeToWorkouts((remoteData) => {
      setWorkoutData((prev) => {
        const merged = { ...prev };
        for (const [userId, days] of Object.entries(remoteData)) {
          if (!merged[userId]) merged[userId] = {};
          for (const [dateKey, day] of Object.entries(days)) {
            if (day && !merged[userId]![dateKey]) {
              merged[userId]![dateKey] = day;
            }
          }
        }
        saveToStorage(merged);
        return merged;
      });
    });

    return () => unsubscribe();
  }, []);

  const getDayWorkout = useCallback((userId: UserId, dateKey: string) => {
    return workoutData[userId]?.[dateKey];
  }, [workoutData]);

  const syncToFirebase = useCallback((userId: UserId, dateKey: string, workout: DayWorkout) => {
    if (firebaseConfigured) {
      fbSaveRef.current(userId, dateKey, workout).catch(() => {});
    }
  }, [firebaseConfigured]);

  const addExercise = useCallback((
    userId: UserId,
    dateKey: string,
    exerciseName: string,
    pattern: ExercisePattern,
    numSets: number
  ) => {
    setWorkoutData((prev) => {
      const newData = { ...prev };
      if (!newData[userId]) newData[userId] = {};
      const day = { ...newData[userId][dateKey] };
      const sets: SetRecord[] = Array.from({ length: numSets }, () => ({
        weightKg: 0,
        reps: 0,
        timestamp: Date.now(),
      }));
      const exercise: ExerciseLog = { exerciseName, pattern, sets };
      const exercises = [...(day.exercises ?? []), exercise];
      const workout: DayWorkout = {
        dayOfWeek: day.dayOfWeek ?? getDayOfWeekFromDateKey(dateKey),
        exercises,
        completed: day.completed ?? false,
      };
      newData[userId] = {
        ...newData[userId],
        [dateKey]: workout,
      };
      syncToFirebase(userId, dateKey, workout);
      return newData;
    });
  }, [syncToFirebase]);

  const updateSet = useCallback((
    userId: UserId,
    dateKey: string,
    exerciseIndex: number,
    setIndex: number,
    weightKg: number,
    reps: number
  ) => {
    setWorkoutData((prev) => {
      const newData = structuredClone(prev);
      const day = newData[userId]?.[dateKey];
      if (!day?.exercises[exerciseIndex]?.sets[setIndex]) return prev;
      day.exercises[exerciseIndex].sets[setIndex] = { weightKg, reps, timestamp: Date.now() };
      syncToFirebase(userId, dateKey, newData[userId]![dateKey]!);
      return newData;
    });
  }, [syncToFirebase]);

  const addSet = useCallback((userId: UserId, dateKey: string, exerciseIndex: number) => {
    setWorkoutData((prev) => {
      const newData = structuredClone(prev);
      const day = newData[userId]?.[dateKey];
      if (!day?.exercises[exerciseIndex]) return prev;
      if (day.exercises[exerciseIndex].sets.length >= 6) return prev;
      day.exercises[exerciseIndex].sets.push({ weightKg: 0, reps: 0, timestamp: Date.now() });
      return newData;
    });
  }, []);

  const removeSet = useCallback((userId: UserId, dateKey: string, exerciseIndex: number, setIndex: number) => {
    setWorkoutData((prev) => {
      const newData = structuredClone(prev);
      const day = newData[userId]?.[dateKey];
      if (!day?.exercises[exerciseIndex]) return prev;
      if (day.exercises[exerciseIndex].sets.length <= 1) return prev;
      day.exercises[exerciseIndex].sets.splice(setIndex, 1);
      return newData;
    });
  }, []);

  const toggleCompleted = useCallback((userId: UserId, dateKey: string) => {
    setWorkoutData((prev) => {
      const newData = structuredClone(prev);
      const day = newData[userId]?.[dateKey];
      if (!day) return prev;
      day.completed = !day.completed;
      return newData;
    });
  }, []);

  const importData = useCallback((data: WorkoutData) => {
    setWorkoutData(data);
  }, []);

  const exportData = useCallback(() => workoutData, [workoutData]);

  const clearAllData = useCallback(() => {
    setWorkoutData({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WorkoutContext.Provider value={{
      workoutData,
      getDayWorkout,
      addExercise,
      updateSet,
      addSet,
      removeSet,
      toggleCompleted,
      importData,
      exportData,
      clearAllData,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextType {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used within WorkoutProvider');
  return ctx;
}
