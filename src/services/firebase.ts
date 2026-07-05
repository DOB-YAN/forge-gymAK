import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  type Unsubscribe,
} from 'firebase/database';
import type { WorkoutData, UserId } from '../types';

// Firebase configuration - user needs to fill in their own values
const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

let app: FirebaseApp | null = null;
let db: ReturnType<typeof getDatabase> | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const hasConfig = Object.values(FIREBASE_CONFIG).some((v) => v !== '');
    if (!hasConfig) {
      throw new Error(
        'Firebase not configured. Set VITE_FIREBASE_* environment variables in .env file.'
      );
    }
    app = initializeApp(FIREBASE_CONFIG);
  }
  return app;
}

function getDatabaseInstance() {
  if (!db) {
    db = getDatabase(getFirebaseApp());
  }
  return db;
}

const WORKOUT_PATH = 'forge-gym/workouts';

export async function saveWorkoutToFirebase(
  userId: UserId,
  dateKey: string,
  workout: unknown
): Promise<void> {
  try {
    const db = getDatabaseInstance();
    const workoutRef = ref(db, `${WORKOUT_PATH}/${userId}/${dateKey}`);
    await set(workoutRef, workout);
  } catch (error) {
    console.warn('Firebase save failed (offline or not configured):', error);
  }
}

export async function loadWorkoutFromFirebase(): Promise<WorkoutData | null> {
  try {
    const db = getDatabaseInstance();
    const workoutRef = ref(db, WORKOUT_PATH);
    const snapshot = await get(workoutRef);
    if (snapshot.exists()) {
      return snapshot.val() as WorkoutData;
    }
    return null;
  } catch (error) {
    console.warn('Firebase load failed (offline or not configured):', error);
    return null;
  }
}

export function subscribeToWorkouts(
  callback: (data: WorkoutData) => void
): Unsubscribe {
  try {
    const db = getDatabaseInstance();
    const workoutRef = ref(db, WORKOUT_PATH);
    return onValue(workoutRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as WorkoutData);
      }
    });
  } catch (error) {
    console.warn('Firebase subscription failed:', error);
    return () => {};
  }
}

export function isFirebaseConfigured(): boolean {
  return Object.values(FIREBASE_CONFIG).every((v) => v !== '');
}
