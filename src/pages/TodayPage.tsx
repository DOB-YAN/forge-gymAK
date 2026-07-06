import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useWorkout } from '../context/WorkoutContext';
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
  const { getDayWorkout, ensureDayExists, deletedExercises } = useWorkout();
  const [showAddModal, setShowAddModal] = useState(false);

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

  // Determine the dayOfWeek for today to filter deleted exercises
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayDayOfWeek = daysOfWeek[today.getDay()];

  // Auto-initialize the day's workout on mount (once)
  useEffect(() => {
    if (schedule.isRestDay) return;
    const exercisesToAdd = schedule.exercises.map((e) => ({
      exerciseName: e.name,
      pattern: e.pattern,
      numSets: e.defaultSets,
    }));
    ensureDayExists(activeUser, dateKey, exercisesToAdd);
    // Only run when user or date changes — NOT on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUser, dateKey]);

  // After ensureDayExists runs, todayWorkout will be populated with the synced exercises
  // Filter out exercises that were deleted from the shared schedule
  const deletedIndices: number[] = deletedExercises[todayDayOfWeek] ?? [];
  const exercises = (todayWorkout?.exercises ?? []).filter((_, i) => !deletedIndices.includes(i));
  const hasStarted = (todayWorkout?.exercises?.length ?? 0) > 0;

  return (
    <div className="space-y-4 page-enter">
      {/* Hero banner */}
      <div
        className="rounded-xl p-5 text-center overflow-hidden relative animate-scaleIn"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
          border: '1px solid rgba(251,191,36,0.15)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(251,191,36,0.08), transparent 60%)',
          }}
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(251,191,36,0.6)' }}>
          {dayName}
        </p>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#f1f5f9' }}>
          {schedule.isRestDay ? 'Time to Recover' : 'Forge Your Strength'}
        </h2>
        <p className="text-sm" style={{ color: 'rgba(148,163,184,0.7)' }}>
          {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          {!schedule.isRestDay && ` · ${schedule.muscleGroups.join(' · ')}`}
        </p>
      </div>

      {/* Rest day */}
      {schedule.isRestDay && (
        <div
          className="rounded-xl p-6 text-center animate-scaleIn"
          style={{
            background: 'linear-gradient(135deg, rgba(30,30,50,0.8), rgba(22,22,40,0.6))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-3xl mb-3">😴</p>
          <p className="font-semibold" style={{ color: '#f1f5f9' }}>Rest Day</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.6)' }}>
            Recover and come back stronger 💪
          </p>
        </div>
      )}

      {/* Exercise cards — directly from todayWorkout, always editable */}
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
          className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all duration-200 active:scale-[0.98]"
          style={{
            borderColor: 'rgba(251,191,36,0.15)',
            color: 'rgba(251,191,36,0.7)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'; e.currentTarget.style.background = 'rgba(251,191,36,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.15)'; e.currentTarget.style.background = 'transparent'; }}
        >
          + Custom Exercise
        </button>
      )}

      {/* Auto-save indicator */}
      {!schedule.isRestDay && hasStarted && (
        <div className="text-center pt-1">
          <span className="text-[10px] font-medium" style={{ color: 'rgba(148,163,184,0.4)' }}>
            ✓ Auto-saving after every entry
          </span>
        </div>
      )}

      {/* Coming Up Tomorrow */}
      <div
        className="rounded-xl p-4 transition-all duration-300 animate-slideUp"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.03))',
          border: '1px solid rgba(251,191,36,0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">📋</span>
            <h3 className="text-sm font-semibold" style={{ color: '#fbbf24' }}>
              {tomorrowSchedule.isRestDay ? 'Tomorrow is Rest Day' : 'Coming Up Tomorrow'}
            </h3>
          </div>
          <span className="text-xs font-medium" style={{ color: 'rgba(251,191,36,0.6)' }}>
            {tomorrowName}
          </span>
        </div>

        {!tomorrowSchedule.isRestDay && (
          <>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tomorrowSchedule.muscleGroups.map((mg) => (
                <span key={mg} className="pill-amber text-[10px]">{mg}</span>
              ))}
            </div>

            <div className="space-y-1">
              {tomorrowSchedule.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="text-sm" style={{ color: 'rgba(203,213,225,0.8)' }}>{ex.name}</span>
                  <span className="text-[10px]" style={{ color: 'rgba(148,163,184,0.5)' }}>{ex.defaultSets} sets</span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2" style={{ borderTop: '1px solid rgba(251,191,36,0.08)' }}>
              <p className="text-[10px] text-center" style={{ color: 'rgba(148,163,184,0.4)' }}>
                Get ready — tomorrow's workout is waiting
              </p>
            </div>
          </>
        )}

        {tomorrowSchedule.isRestDay && (
          <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
            Take time to recover and come back stronger
          </p>
        )}
      </div>

      <AddExerciseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        dateKey={dateKey}
      />
    </div>
  );
}
