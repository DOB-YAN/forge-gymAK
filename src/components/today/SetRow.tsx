import { useUser } from '../../context/UserContext';
import { USER_COLORS } from '../../types';
import type { SetRecord } from '../../types';

interface SetRowProps {
  setIndex: number;
  setData: SetRecord;
  previousSet?: SetRecord;
  onUpdate: (weightKg: number, reps: number) => void;
  onRemove?: () => void;
  canRemove: boolean;
}

export default function SetRow({ setIndex, setData, previousSet, onUpdate, onRemove, canRemove }: SetRowProps) {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];

  return (
    <div className="flex items-center gap-3 py-2 group">
      <span className="w-8 text-center text-sm font-medium text-gray-400">
        {setIndex + 1}
      </span>

      <div className="flex-1">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          placeholder="kg"
          value={setData.weightKg || ''}
          onChange={(e) => onUpdate(parseFloat(e.target.value) || 0, setData.reps)}
          className="input-field text-center"
          style={{
            borderColor: setData.weightKg > 0 ? colors.border : undefined,
          }}
        />
        {previousSet && previousSet.weightKg > 0 && (
          <p className="text-[10px] text-gray-400 text-center mt-0.5">
            last: {previousSet.weightKg}kg
          </p>
        )}
      </div>

      <span className="text-gray-400 text-sm font-medium">×</span>

      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="reps"
          value={setData.reps || ''}
          onChange={(e) => onUpdate(setData.weightKg, parseInt(e.target.value) || 0)}
          className="input-field text-center"
          style={{
            borderColor: setData.reps > 0 ? colors.border : undefined,
          }}
        />
        {previousSet && previousSet.reps > 0 && (
          <p className="text-[10px] text-gray-400 text-center mt-0.5">
            last: {previousSet.reps}
          </p>
        )}
      </div>

      {canRemove && (
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
