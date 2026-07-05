import { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useUser } from '../context/UserContext';
import { USER_COLORS } from '../types';
import { WEEKLY_SCHEDULE } from '../data/schedule';
import type { ExercisePattern } from '../types';

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

  return (            <form onSubmit={handleSubmit} className="mt-3 p-3 rounded-lg space-y-3" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))' }}>
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
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
              pattern === p.value ? 'text-white' : 'bg-white text-gray-500 border border-gray-200'
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
        </button>          <button
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
  const [deletedExercises, setDeletedExercises] = useState<Record<string, number[]>>({});

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
      <h2 className="text-lg font-bold text-gray-800">Schedule</h2>

      {WEEKLY_SCHEDULE.map((day) => {
        const isExpanded = expandedDay === day.dayOfWeek;
        const isAdding = addingToDay === day.dayOfWeek;

        return (
          <div key={day.dayOfWeek} className="card overflow-hidden animate-slideUp">
            <button
              onClick={() => setExpandedDay(isExpanded ? null : day.dayOfWeek)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="text-xl">{day.isRestDay ? '😴' : '💪'}</div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">{day.label}</p>
                  <p className="text-xs text-gray-400">
                    {day.isRestDay ? 'Rest day' : day.muscleGroups.join(' · ')}
                  </p>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {(() => {
                  const filtered = day.exercises.filter((_, i) => !(deletedExercises[day.dayOfWeek] || []).includes(i));
                  if (filtered.length === 0) {
                    return <p className="text-sm text-gray-400 text-center py-4">No exercises yet. Tap below to add your first workout.</p>;
                  }
                  return (
                    <div className="space-y-1 mb-3">
                      {filtered.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 group">
                          <div>
                            <span className="text-sm font-medium text-gray-700">{ex.name}</span>
                            {ex.pattern !== 'normal' && (
                              <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                {ex.pattern.replace('_', ' ')}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 ml-2">{ex.defaultSets} sets</span>
                          </div>
                          <button
                            onClick={() => handleDeleteExercise(day.dayOfWeek, i)}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {isAdding ? (
                  <AddExerciseForm
                    dateKey={day.dayOfWeek}
                    onClose={() => setAddingToDay(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingToDay(day.dayOfWeek)}
                    className="w-full py-2 rounded-lg border-2 border-dashed text-sm font-medium transition-all duration-200 hover:bg-gray-50"
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
