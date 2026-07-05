import { useState, useMemo, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useWorkout } from '../context/WorkoutContext';
import { USER_COLORS } from '../types';
import { getDaySchedule } from '../data/schedule';
import { formatDateKey, getLastWeekDateKey } from '../utils/dates';
import WorkoutCard from '../components/today/WorkoutCard';
import AddExerciseModal from '../components/today/AddExerciseModal';


const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
];

export default function TodayPage() {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];
  const { getDayWorkout, addExercise } = useWorkout();
  const [showAddModal, setShowAddModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const today = new Date();
  const dateKey = formatDateKey(today);
  const schedule = getDaySchedule(today);
  const dayName = DAY_NAMES[today.getDay()];
  const lastWeekKey = getLastWeekDateKey(dateKey);

  const todayWorkout = getDayWorkout(activeUser, dateKey);
  const lastWeekWorkout = getDayWorkout(activeUser, lastWeekKey);

  // Compute next day's schedule
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowSchedule = getDaySchedule(tomorrow);
  const tomorrowName = DAY_NAMES[tomorrow.getDay()];

  // Merge preset exercises with any custom ones logged
  const exercises = useMemo(() => {
    if (!todayWorkout?.exercises || todayWorkout.exercises.length === 0) {
      // No exercises yet - show presets from schedule
      return schedule.exercises.map((e) => ({
        exerciseName: e.name,
        pattern: e.pattern,
        sets: Array.from({ length: e.defaultSets }, () => ({
          weightKg: 0,
          reps: 0,
          timestamp: Date.now(),
        })),
      }));
    }
    return todayWorkout.exercises;
  }, [todayWorkout, schedule]);

  const handleStartPreset = () => {
    if (!todayWorkout || todayWorkout.exercises.length === 0) {
      // Start all preset exercises
      schedule.exercises.forEach((e) => {
        addExercise(activeUser, dateKey, e.name, e.pattern, e.defaultSets);
      });
    }
  };

  const hasStarted = todayWorkout?.exercises && todayWorkout.exercises.length > 0;

  const handleSaveWorkout = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  return (
    <div className="space-y-4 page-enter">
      {/* Day header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{dayName}</h2>
          <p className="text-sm text-gray-400">
            {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {schedule.muscleGroups.map((mg) => (
            <span
              key={mg}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: colors.bg, color: colors.primary }}
            >
              {mg}
            </span>
          ))}
        </div>
      </div>

      {/* Rest day */}
      {schedule.isRestDay && (
        <div className="text-center py-8 rounded-xl animate-scaleIn" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
          border: '1px solid rgba(255,255,255,0.6)',
        }}>
          <p className="text-3xl mb-2">😴</p>
          <p className="text-gray-500 font-semibold">Rest Day</p>
          <p className="text-sm text-gray-400 mt-1">Recover and grow stronger 💪</p>
        </div>
      )}

      {/* Start workout prompt */}
      {!schedule.isRestDay && !hasStarted && (
        <button
          onClick={handleStartPreset}
          className="w-full text-center py-6 cursor-pointer transition-all duration-300 active:scale-[0.98] group animate-scaleIn"
          style={{
            background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(255,255,255,0.8) 100%)`,
            borderRadius: '12px',
            border: `2px dashed ${colors.border}`,
          }}
        >
          <p className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">💪</p>
          <p className="font-semibold" style={{ color: colors.primary }}>
            Start Today's Workout
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {schedule.exercises.length} exercises ready
          </p>
        </button>
      )}

      {/* Exercise cards */}
      {!schedule.isRestDay && (
        <div className="space-y-3">
          {exercises.map((exercise, i) => (
            <WorkoutCard
              key={`${exercise.exerciseName}-${i}`}
              exercise={exercise}
              exerciseIndex={i}
              dateKey={dateKey}
              previousExercise={lastWeekWorkout?.exercises[i]}
            />
          ))}
        </div>
      )}

      {/* Add custom exercise button */}
      {!schedule.isRestDay && hasStarted && (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all duration-200 hover:bg-white/60 active:scale-[0.98]"
          style={{ borderColor: colors.border, color: colors.primary }}
        >
          + Custom Exercise
        </button>
      )}

      {/* Save Workout button */}
      {!schedule.isRestDay && hasStarted && (
        <button
          onClick={handleSaveWorkout}
          className="btn-primary w-full py-3 text-base"
          style={{ backgroundColor: colors.primary }}
        >
          {saved ? '✓ Workout Saved!' : 'Save Workout'}
        </button>
      )}

      {/* Coming Up Tomorrow */}
      {!tomorrowSchedule.isRestDay && (
        <div
          className="rounded-xl p-4 transition-all duration-300 animate-slideUp"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">📋</span>
              <h3 className="text-sm font-semibold text-white">Coming Up Tomorrow</h3>
            </div>
            <span className="text-xs font-medium text-amber-400">{tomorrowName}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {tomorrowSchedule.muscleGroups.map((mg) => (
              <span
                key={mg}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: 'rgba(251,191,36,0.15)',
                  color: '#fbbf24',
                  border: '1px solid rgba(251,191,36,0.2)',
                }}
              >
                {mg}
              </span>
            ))}
          </div>

          <div className="space-y-1">
            {tomorrowSchedule.exercises.map((ex, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1 px-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-sm text-gray-300">{ex.name}</span>
                <span className="text-[10px] text-gray-500">{ex.defaultSets} sets</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-white/10">
            <p className="text-[10px] text-gray-500 text-center">
              Get ready — tomorrow's workout is waiting
            </p>
          </div>
        </div>
      )}

      {/* Coming Up Tomorrow - Rest Day variant */}
      {tomorrowSchedule.isRestDay && (
        <div
          className="rounded-xl p-4 transition-all duration-300 animate-slideUp"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">😴</span>
            <h3 className="text-sm font-semibold text-white">Tomorrow is Rest Day</h3>
          </div>
          <p className="text-xs text-gray-400">
            {tomorrowName} — take time to recover and come back stronger
          </p>
        </div>
      )}

      <AddExerciseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        dateKey={dateKey}
      />
    </div>
  );
}
