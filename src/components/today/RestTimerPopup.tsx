import { useTimer } from '../../context/TimerContext';
import type { RestTimerPreset } from '../../types';

const presets: RestTimerPreset[] = [1, 2, 3, 4, 5];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function RestTimerPopup() {
  const {
    isRunning, isMinimized, remainingSeconds, totalSeconds,
    activePreset, startTimer, pauseTimer, resumeTimer, stopTimer,
    minimizeTimer, restoreTimer,
  } = useTimer();

  const progress = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  // Quick start buttons (shown when timer is not running)
  if (!activePreset && !isRunning) {
    return (
      <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-2 flex items-center gap-2 pointer-events-auto">
          <span className="text-xs font-medium text-gray-400 mr-1">Rest</span>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => startTimer(p)}
              className="w-9 h-9 rounded-lg text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-90"
            >
              {p}m
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={restoreTimer}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-xl hover:shadow-xl transition-all duration-200 active:scale-90"
      >
        ⏱️
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-72 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500">Rest Timer</h3>
          <div className="flex gap-1">
            <button
              onClick={minimizeTimer}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={stopTimer}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Timer circle */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" fill="none" stroke="#E5E7EB" strokeWidth="6" />
            <circle
              cx="64" cy="64" r="56"
              fill="none"
              stroke={remainingSeconds > 10 ? '#3B82F6' : '#EF4444'}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${remainingSeconds > 10 ? 'text-gray-800' : 'text-red-500 animate-pulse'}`}>
              {formatTime(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="flex justify-center gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => startTimer(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${activePreset === p
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
            >
              {p}m
            </button>
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-3">
          {isRunning ? (
            <button
              onClick={pauseTimer}
              className="px-8 py-2.5 rounded-xl font-semibold text-sm bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all duration-200 active:scale-95"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="px-8 py-2.5 rounded-xl font-semibold text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 active:scale-95"
            >
              Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
