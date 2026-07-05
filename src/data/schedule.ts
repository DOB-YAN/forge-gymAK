import type { DaySchedule, DayOfWeek } from '../types';

export const WEEKLY_SCHEDULE: DaySchedule[] = [
  {
    dayOfWeek: 'monday',
    label: 'Monday',
    muscleGroups: ['Chest', 'Shoulders', 'Biceps'],
    isRestDay: false,
    exercises: [
      { name: 'Bench Press', pattern: 'normal', defaultSets: 4 },
      { name: 'Incline Dumbbell Press', pattern: 'normal', defaultSets: 3 },
      { name: 'Shoulder Press', pattern: 'normal', defaultSets: 4 },
      { name: 'Lateral Raises', pattern: 'normal', defaultSets: 3 },
      { name: 'Barbell Curl', pattern: 'normal', defaultSets: 3 },
      { name: 'Hammer Curl', pattern: 'normal', defaultSets: 3 },
    ],
  },
  {
    dayOfWeek: 'tuesday',
    label: 'Tuesday',
    muscleGroups: ['Back', 'Biceps', 'Forearms'],
    isRestDay: false,
    exercises: [
      { name: 'Deadlift', pattern: 'normal', defaultSets: 3 },
      { name: 'Pull-Ups', pattern: 'normal', defaultSets: 4 },
      { name: 'Barbell Row', pattern: 'normal', defaultSets: 4 },
      { name: 'Face Pull', pattern: 'normal', defaultSets: 3 },
      { name: 'Preacher Curl', pattern: 'normal', defaultSets: 3 },
      { name: 'Wrist Curl', pattern: 'normal', defaultSets: 3 },
    ],
  },
  {
    dayOfWeek: 'wednesday',
    label: 'Wednesday',
    muscleGroups: ['Rest'],
    isRestDay: true,
    exercises: [],
  },
  {
    dayOfWeek: 'thursday',
    label: 'Thursday',
    muscleGroups: ['Arms'],
    isRestDay: false,
    exercises: [
      { name: 'Tricep Pushdown', pattern: 'normal', defaultSets: 4 },
      { name: 'Skull Crushers', pattern: 'normal', defaultSets: 3 },
      { name: 'Barbell Curl', pattern: 'normal', defaultSets: 3 },
      { name: 'Overhead Tricep Extension', pattern: 'normal', defaultSets: 3 },
      { name: 'Hammer Curl', pattern: 'normal', defaultSets: 3 },
      { name: 'Lateral Raises', pattern: 'normal', defaultSets: 3 },
      { name: 'Wrist Curl', pattern: 'normal', defaultSets: 3 },
    ],
  },
  {
    dayOfWeek: 'friday',
    label: 'Friday',
    muscleGroups: ['Chest', 'Back'],
    isRestDay: false,
    exercises: [
      { name: 'Incline Bench Press', pattern: 'normal', defaultSets: 4 },
      { name: 'Dumbbell Flyes', pattern: 'normal', defaultSets: 3 },
      { name: 'T-Bar Row', pattern: 'normal', defaultSets: 4 },
      { name: 'Lat Pulldown', pattern: 'normal', defaultSets: 3 },
      { name: 'Push-Ups', pattern: 'normal', defaultSets: 3 },
    ],
  },
  {
    dayOfWeek: 'saturday',
    label: 'Saturday',
    muscleGroups: ['Legs'],
    isRestDay: false,
    exercises: [
      { name: 'Squat', pattern: 'normal', defaultSets: 4 },
      { name: 'Romanian Deadlift', pattern: 'normal', defaultSets: 3 },
      { name: 'Leg Press', pattern: 'normal', defaultSets: 3 },
      { name: 'Leg Extension', pattern: 'normal', defaultSets: 3 },
      { name: 'Leg Curl', pattern: 'normal', defaultSets: 3 },
      { name: 'Calf Raises', pattern: 'normal', defaultSets: 4 },
    ],
  },
  {
    dayOfWeek: 'sunday',
    label: 'Sunday',
    muscleGroups: ['Rest'],
    isRestDay: true,
    exercises: [],
  },
];

export const DAY_OF_WEEK_MAP: Record<string, string> = {
  sunday: 'sunday',
  monday: 'monday',
  tuesday: 'tuesday',
  wednesday: 'wednesday',
  thursday: 'thursday',
  friday: 'friday',
  saturday: 'saturday',
};

export function getDaySchedule(date: Date): DaySchedule {
  const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const days: DayOfWeek[] = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday',
  ];
  const dayOfWeek = days[dayIndex];
  return WEEKLY_SCHEDULE.find((s) => s.dayOfWeek === dayOfWeek) ?? WEEKLY_SCHEDULE[0];
}

export function getWeekDateRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
}
