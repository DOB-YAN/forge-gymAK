import { useState, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useUser } from '../context/UserContext';
import { USER_COLORS } from '../types';
import { WEEKLY_SCHEDULE } from '../data/schedule';
import type { ExercisePattern } from '../types';

const DELETED_KEY = 'forge_gym_deleted_exercises';

function loadDeletedExercises(): Record<string, number[]> {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveDeletedExercises(data: Record<string, number[]>) {
  try {
    localStorage.setItem(DELETED_KEY, JSON.stringify(data));
  } catch {}
}

interface AddExerciseFormProps {
  dateKey: string;
  onClose: () => void;
}

function AddExerciseForm({ dateKey, onClose }: AddExerciseFormProps) {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];
  const { addExercise } = useWorkout();
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState<ExercisePattern>('normal');
  const [numSets, setNumSets] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addExercise(activeUser, dateKey, name.trim(), pattern, numSets);
    setName('');
    setPattern('normal');
    setNumSets(4);
    onClose();
  };

  const patterns: { value: ExercisePattern; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'drop_set', label: 'Drop Set' },
    { value: 'superset', label: 'Superset' },
    { value: 'pyramid', label: 'Pyramid' },
  ];

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 rounded-lg space-y-3 animate-slideUp"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))' }}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Exercise name (e.g. Bench Press)"
        className="input-field text-left text-sm"
        autoFocus
      />
      <div className="flex gap-2 flex-wrap">
        {patterns.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPattern(p.value)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              pattern === p.value
                ? 'text-white shadow-sm'
                : 'bg-white/70 text-gray-500 border border-gray-200 hover:bg-white'
            }`}
            style={{ backgroundColor: pattern === p.value ? colors.primary : undefined }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs text-gray-400">Sets: {numSets}</label>
        <input
          type="range"
          min={1}
          max={6}
          value={numSets}
          onChange={(e) => setNumSets(parseInt(e.target.value))}
          className="w-full"
          style={{ accentColor: colors.primary }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="btn-primary flex-1 text-sm"
          style={{ backgroundColor: colors.primary }}
          disabled={!name.trim()}
        >
          Add
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary flex-1 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function SchedulePage() {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [addingToDay, setAddingToDay] = useState<string | null>(null);
  const [deletedExercises, setDeletedExercises] = useState<Record<string, number[]>>(loadDeletedExercises);

  // Persist to localStorage whenever deletedExercises changes
  useEffect(() => {
    saveDeletedExercises(deletedExercises);
  }, [deletedExercises]);

  const handleDeleteExercise = (dayOfWeek: string, exerciseIndex: number) => {
    setDeletedExercises((prev) => {
      const existing = [...(prev[dayOfWeek] || [])];
      if (!existing.includes(exerciseIndex)) {
        existing.push(exerciseIndex);
      }
      return { ...prev, [dayOfWeek]: existing };
    });
  };

  return (
    <div className="space-y-3 page-enter">
      <h2 className="text-lg font-bold text-gray-800">Weekly Schedule</h2>

      {WEEKLY_SCHEDULE.map((day, dayIdx) => {
        const isExpanded = expandedDay === day.dayOfWeek;
        const isAdding = addingToDay === day.dayOfWeek;
        const filtered = day.exercises.filter((_, i) => !(deletedExercises[day.dayOfWeek] || []).includes(i));
        const hasDeleted = (deletedExercises[day.dayOfWeek]?.length || 0) > 0;

        return (
          <div
            key={day.dayOfWeek}
            className="card overflow-hidden animate-slideUp"
            style={{ animationDelay: `${dayIdx * 60}ms` }}
          >
            <button
              onClick={() => setExpandedDay(isExpanded ? null : day.dayOfWeek)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{
                    background: day.isRestDay
                      ? 'linear-gradient(135deg, #f0f0f0, #e5e5e5)'
                      : `linear-gradient(135deg, ${colors.bg}, rgba(255,255,255,0.5))`,
                  }}
                >
                  {day.isRestDay ? '😴' : '💪'}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">{day.label}</p>
                  <p className="text-xs text-gray-400">
                    {day.isRestDay
                      ? 'Rest day'
                      : `${day.muscleGroups.join(' · ')} · ${filtered.length} exercises`}
                  </p>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-100/80 animate-fadeIn">
                {filtered.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400">No exercises scheduled</p>
                    <p className="text-xs text-gray-300 mt-1">Add exercises below</p>
                  </div>
                ) : (
                  <div className="space-y-1 mb-3">
                    {filtered.map((ex, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/60 group transition-all duration-200 animate-slideUp"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                          <span className="text-sm font-medium text-gray-700">{ex.name}</span>
                          {ex.pattern !== 'normal' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: colors.bg, color: colors.primary }}
                            >
                              {ex.pattern.replace('_', ' ')}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{ex.defaultSets} sets</span>
                        </div>
                        <button
                          onClick={() => handleDeleteExercise(day.dayOfWeek, i)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all duration-200 active:scale-90"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {hasDeleted && (
                      <p className="text-[10px] text-gray-400 text-center pt-1">
                        Deleted exercises won't show for anyone visiting the website
                      </p>
                    )}
                  </div>
                )}

                {isAdding ? (
                  <AddExerciseForm
                    dateKey={day.dayOfWeek}
                    onClose={() => setAddingToDay(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingToDay(day.dayOfWeek)}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-all duration-200 hover:bg-white/60 active:scale-[0.98]"
                    style={{ borderColor: colors.border, color: colors.primary }}
                  >
                    + Add Exercise
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
