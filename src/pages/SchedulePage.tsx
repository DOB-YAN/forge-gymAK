import { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { WEEKLY_SCHEDULE } from '../data/schedule';
import type { ExercisePattern, DayOfWeek, PresetExercise } from '../types';

interface AddExerciseFormProps {
  dayOfWeek: DayOfWeek;
  onClose: () => void;
}

function AddExerciseForm({ dayOfWeek, onClose }: AddExerciseFormProps) {
  const { addExerciseToSchedule } = useSchedule();
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState<ExercisePattern>('normal');
  const [numSets, setNumSets] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addExerciseToSchedule(dayOfWeek, {
      name: name.trim(),
      pattern,
      defaultSets: numSets,
    });
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
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.1)' }}
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
              pattern === p.value ? 'text-gray-900' : 'text-gray-400 border'
            }`}
            style={{
              background: pattern === p.value ? '#fbbf24' : 'rgba(255,255,255,0.06)',
              borderColor: pattern === p.value ? '#fbbf24' : 'rgba(255,255,255,0.08)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>Sets: {numSets}</label>
        <input
          type="range"
          min={1}
          max={6}
          value={numSets}
          onChange={(e) => setNumSets(parseInt(e.target.value))}
          className="w-full"
          style={{ accentColor: '#fbbf24' }}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 text-sm" disabled={!name.trim()}>
          Add
        </button>
        <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

interface EditExerciseFormProps {
  dayOfWeek: DayOfWeek;
  exerciseIndex: number;
  exercise: PresetExercise;
  onClose: () => void;
}

function EditExerciseForm({ dayOfWeek, exerciseIndex, exercise, onClose }: EditExerciseFormProps) {
  const { updateExerciseInSchedule } = useSchedule();
  const [name, setName] = useState(exercise.name);
  const [pattern, setPattern] = useState<ExercisePattern>(exercise.pattern);
  const [numSets, setNumSets] = useState(exercise.defaultSets);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateExerciseInSchedule(dayOfWeek, exerciseIndex, {
      name: name.trim(),
      pattern,
      defaultSets: numSets,
    });
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
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.1)' }}
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
              pattern === p.value ? 'text-gray-900' : 'text-gray-400 border'
            }`}
            style={{
              background: pattern === p.value ? '#fbbf24' : 'rgba(255,255,255,0.06)',
              borderColor: pattern === p.value ? '#fbbf24' : 'rgba(255,255,255,0.08)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>Sets: {numSets}</label>
        <input
          type="range"
          min={1}
          max={6}
          value={numSets}
          onChange={(e) => setNumSets(parseInt(e.target.value))}
          className="w-full"
          style={{ accentColor: '#fbbf24' }}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 text-sm" disabled={!name.trim()}>
          Save
        </button>
        <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function SchedulePage() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [addingToDay, setAddingToDay] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<{ day: string; index: number } | null>(null);
  const { removeExerciseFromSchedule, getScheduleForDay, clearDaySchedule } = useSchedule();

  return (
    <div className="space-y-3 page-enter">
      <h2 className="section-title">Weekly Schedule</h2>

      {WEEKLY_SCHEDULE.map((day, dayIdx) => {
        const isExpanded = expandedDay === day.dayOfWeek;
        const isAdding = addingToDay === day.dayOfWeek;
        const isEditing = editingExercise?.day === day.dayOfWeek;
        const allExercises = getScheduleForDay(day.dayOfWeek, day.exercises);

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
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(255,255,255,0.05))',
                  }}
                >
                  {day.isRestDay ? '😴' : '💪'}
                </div>
                <div className="text-left">
                  <p className="font-semibold" style={{ color: '#f1f5f9' }}>{day.label}</p>
                  <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
                    {day.isRestDay
                      ? 'Rest day'
                      : `${day.muscleGroups.join(' · ')} · ${allExercises.length} exercises`}
                    </p>
                </div>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                style={{ color: 'rgba(148,163,184,0.4)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="mt-3 pt-3 animate-fadeIn" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {allExercises.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>No exercises scheduled</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(148,163,184,0.4)' }}>Add exercises below</p>
                  </div>
                ) : (
                  <div className="space-y-0.5 mb-3">
                    {allExercises.map((ex, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 group animate-slideUp"
                        style={{ animationDelay: `${i * 30}ms` }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
                          <span className="text-sm font-medium" style={{ color: 'rgba(203,213,225,0.9)' }}>{ex.name}</span>
                          {ex.pattern !== 'normal' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}
                            >
                              {ex.pattern.replace('_', ' ')}
                            </span>
                          )}
                          <span className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>{ex.defaultSets} sets</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingExercise({ day: day.dayOfWeek, index: i })}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-90"
                            style={{ color: 'rgba(251,191,36,0.5)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            title="Edit exercise"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeExerciseFromSchedule(day.dayOfWeek, i)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-90"
                            style={{ color: 'rgba(239,68,68,0.5)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {isEditing && editingExercise ? (
                    <EditExerciseForm
                      dayOfWeek={day.dayOfWeek}
                      exerciseIndex={editingExercise.index}
                      exercise={allExercises[editingExercise.index]}
                      onClose={() => setEditingExercise(null)}
                    />
                  ) : isAdding ? (
                    <AddExerciseForm dayOfWeek={day.dayOfWeek} onClose={() => setAddingToDay(null)} />
                  ) : (
                    <button
                      onClick={() => setAddingToDay(day.dayOfWeek)}
                      className="flex-1 py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-all duration-200 active:scale-[0.98]"
                      style={{ borderColor: 'rgba(251,191,36,0.15)', color: 'rgba(251,191,36,0.7)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'; e.currentTarget.style.background = 'rgba(251,191,36,0.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.15)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      + Add Exercise
                    </button>
                  )}
                  {allExercises.length > 0 && !isEditing && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Clear all exercises from ${day.label}?`)) {
                          clearDaySchedule(day.dayOfWeek);
                        }
                      }}
                      className="py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]"
                      style={{ background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.2)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
