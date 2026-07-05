import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useTimer } from '../../context/TimerContext';
import { USER_COLORS } from '../../types';
import type { ExerciseLog } from '../../types';
import SetRow from './SetRow';

interface WorkoutCardProps {
  exercise: ExerciseLog;
  exerciseIndex: number;
  dateKey: string;
  previousExercise?: ExerciseLog;
}

export default function WorkoutCard({ exercise, exerciseIndex, dateKey, previousExercise }: WorkoutCardProps) {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];
  const { updateSet, addSet, removeSet } = useWorkout();
  const { startTimer } = useTimer();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalVolume = exercise.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);

  const handleUpdateSet = (setIndex: number, weightKg: number, reps: number) => {
    updateSet(activeUser, dateKey, exerciseIndex, setIndex, weightKg, reps);
  };

  const handleAddSet = () => {
    addSet(activeUser, dateKey, exerciseIndex);
  };

  const handleRemoveSet = (setIndex: number) => {
    removeSet(activeUser, dateKey, exerciseIndex, setIndex);
  };

  return (
    <div className="card mb-3 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between mb-2"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800 text-sm">{exercise.exerciseName}</h3>
          {exercise.pattern !== 'normal' && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: colors.bg, color: colors.primary }}
            >
              {exercise.pattern.replace('_', ' ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); startTimer(2); }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-all duration-200 active:scale-90"
            title="Start rest timer"
          >
            ⏱
          </button>
          {totalVolume > 0 && (
            <span className="text-xs text-gray-400 font-medium">
              {totalVolume} kg
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {!isCollapsed && (
        <>
          {/* Column headers */}
          <div className="flex items-center gap-3 pl-8 mb-1">
            <div className="flex-1 text-center">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Weight</span>
            </div>
            <div className="flex-1 text-center">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Reps</span>
            </div>
          </div>

          {/* Sets */}
          <div className="space-y-1">
            {exercise.sets.map((set, i) => (
              <SetRow
                key={i}
                setIndex={i}
                setData={set}
                previousSet={previousExercise?.sets[i]}
                onUpdate={(kg, reps) => handleUpdateSet(i, kg, reps)}
                onRemove={() => handleRemoveSet(i)}
                canRemove={exercise.sets.length > 1}
              />
            ))}
          </div>

          {/* Add set button */}
          {exercise.sets.length < 6 && (
            <button
              onClick={handleAddSet}
              className="w-full mt-2 py-2 rounded-lg border-2 border-dashed text-sm font-medium transition-all duration-200 hover:bg-gray-50 active:scale-[0.99]"
              style={{ borderColor: colors.border, color: colors.primary }}
            >
              + Add Set
            </button>
          )}
        </>
      )}
    </div>
  );
}
