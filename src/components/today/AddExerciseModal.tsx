import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useWorkout } from '../../context/WorkoutContext';
import { USER_COLORS } from '../../types';
import type { ExercisePattern } from '../../types';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
}

const patterns: { value: ExercisePattern; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'drop_set', label: 'Drop Set' },
  { value: 'superset', label: 'Superset' },
  { value: 'pyramid', label: 'Pyramid' },
];

export default function AddExerciseModal({ isOpen, onClose, dateKey }: AddExerciseModalProps) {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];
  const { addExercise } = useWorkout();

  const [exerciseName, setExerciseName] = useState('');
  const [pattern, setPattern] = useState<ExercisePattern>('normal');
  const [numSets, setNumSets] = useState(4);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    addExercise(activeUser, dateKey, exerciseName.trim(), pattern, numSets);
    setExerciseName('');
    setPattern('normal');
    setNumSets(4);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Add Exercise</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Exercise Name</label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="e.g. Dumbbell Flyes"
              className="input-field text-left"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Pattern</label>
            <div className="grid grid-cols-2 gap-2">
              {patterns.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPattern(p.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${pattern === p.value
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  style={{
                    backgroundColor: pattern === p.value ? colors.primary : undefined,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Sets: <span className="font-bold" style={{ color: colors.primary }}>{numSets}</span>
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={numSets}
              onChange={(e) => setNumSets(parseInt(e.target.value))}
              className="w-full accent-blue-500"
              style={{ accentColor: colors.primary }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>6</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            style={{ backgroundColor: colors.primary }}
            disabled={!exerciseName.trim()}
          >
            Add Exercise
          </button>
        </form>
      </div>
    </div>
  );
}
