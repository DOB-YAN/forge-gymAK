import type { ExerciseLog, ProgressData } from '../types';

export function calculateVolume(exercise: ExerciseLog): number {
  return exercise.sets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
}

export function calculateMaxWeight(exercise: ExerciseLog): number {
  if (exercise.sets.length === 0) return 0;
  return Math.max(...exercise.sets.map((s) => s.weightKg));
}

export function calculateTotalReps(exercise: ExerciseLog): number {
  return exercise.sets.reduce((sum, set) => sum + set.reps, 0);
}

export function calculateExerciseProgress(exercise: ExerciseLog): ProgressData {
  return {
    maxWeight: calculateMaxWeight(exercise),
    totalReps: calculateTotalReps(exercise),
    totalVolume: calculateVolume(exercise),
    dateKey: '',
  };
}

export function aggregateMuscleGroupVolume(
  exercises: ExerciseLog[],
  exerciseMuscleMap: Record<string, string[]>
): { muscleGroup: string; volume: number }[] {
  const volumeMap: Record<string, number> = {};

  for (const exercise of exercises) {
    const volume = calculateVolume(exercise);
    const groups = exerciseMuscleMap[exercise.exerciseName] ?? ['Other'];
    for (const group of groups) {
      volumeMap[group] = (volumeMap[group] ?? 0) + volume;
    }
  }

  return Object.entries(volumeMap)
    .map(([muscleGroup, volume]) => ({ muscleGroup, volume }))
    .sort((a, b) => b.volume - a.volume);
}

export const EXERCISE_MUSCLE_MAP: Record<string, string[]> = {
  'Bench Press': ['Chest', 'Shoulders'],
  'Incline Dumbbell Press': ['Chest', 'Shoulders'],
  'Incline Bench Press': ['Chest', 'Shoulders'],
  'Dumbbell Flyes': ['Chest'],
  'Push-Ups': ['Chest', 'Shoulders'],
  'Shoulder Press': ['Shoulders'],
  'Lateral Raises': ['Shoulders'],
  'Face Pull': ['Shoulders', 'Back'],
  'Barbell Row': ['Back'],
  'T-Bar Row': ['Back'],
  'Lat Pulldown': ['Back'],
  'Pull-Ups': ['Back'],
  'Deadlift': ['Back', 'Legs'],
  'Barbell Curl': ['Biceps'],
  'Hammer Curl': ['Biceps', 'Forearms'],
  'Preacher Curl': ['Biceps'],
  'Tricep Pushdown': ['Triceps'],
  'Skull Crushers': ['Triceps'],
  'Overhead Tricep Extension': ['Triceps'],
  'Wrist Curl': ['Forearms'],
  'Squat': ['Legs'],
  'Romanian Deadlift': ['Legs', 'Back'],
  'Leg Press': ['Legs'],
  'Leg Extension': ['Legs'],
  'Leg Curl': ['Legs'],
  'Calf Raises': ['Legs'],
};
