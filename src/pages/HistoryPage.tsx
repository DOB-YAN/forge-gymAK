import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useUser } from '../context/UserContext';
import { useWorkout } from '../context/WorkoutContext';
import { USER_COLORS } from '../types';
import { getDaySchedule } from '../data/schedule';
import { formatDisplayDate, getMonthDateKeys } from '../utils/dates';
import { calculateVolume } from '../utils/calculations';

export default function HistoryPage() {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];
  const { workoutData } = useWorkout();

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Get all date keys for the month
  const monthDateKeys = useMemo(
    () => getMonthDateKeys(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  // Get workouts for the month
  const monthWorkouts = useMemo(() => {
    const userData = workoutData[activeUser];
    if (!userData) return [];

    return monthDateKeys
      .map((dateKey) => {
        const day = userData[dateKey];
        if (!day) return null;
        return { dateKey, day };
      })
      .filter(Boolean) as { dateKey: string; day: NonNullable<typeof userData[string]> }[];
  }, [workoutData, activeUser, monthDateKeys]);

  // Daily volume trend
  const volumeTrend = useMemo(() => {
    return monthWorkouts.map(({ dateKey, day }) => {
      const totalVolume = day.exercises?.reduce((sum, e) => sum + calculateVolume(e), 0) ?? 0;
      return {
        display: formatDisplayDate(dateKey),
        volume: totalVolume,
        exerciseCount: day.exercises?.length ?? 0,
      };
    });
  }, [monthWorkouts]);

  const monthlyTotalVolume = volumeTrend.reduce((sum, d) => sum + d.volume, 0);

  // Month picker
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-4 page-enter">
      <h2 className="text-lg font-bold text-gray-800">History</h2>

      {/* Month selector */}
      <div className="flex items-center justify-between card">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-gray-700">
          {months[selectedMonth]} {selectedYear}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Workouts</p>
          <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>
            {monthWorkouts.length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Volume</p>
          <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>
            {monthlyTotalVolume.toLocaleString()}
            <span className="text-sm text-gray-400 ml-1">kg</span>
          </p>
        </div>
      </div>

      {/* Volume trend chart */}
      {volumeTrend.length >= 2 ? (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Daily Volume Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={volumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="display"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ fill: colors.primary, r: 3 }}
                activeDot={{ r: 5 }}
                name="Volume (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-400">Not enough data for trends this month.</p>
        </div>
      )}

      {/* Daily summaries */}
      {monthWorkouts.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500">Daily Summaries</h3>
          {monthWorkouts.map(({ dateKey, day }) => {
            const schedule = getDaySchedule(new Date(dateKey));
            return (
              <details key={dateKey} className="card group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {formatDisplayDate(dateKey)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {schedule.label} — {schedule.muscleGroups.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: colors.primary }}>
                        {day.exercises?.reduce((sum, e) => sum + calculateVolume(e), 0).toLocaleString()} kg
                      </p>
                      <p className="text-xs text-gray-400">
                        {day.exercises?.length ?? 0} exercises
                      </p>
                    </div>
                  </div>
                </summary>
                <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                  {day.exercises?.map((exercise, i) => {
                    const volume = calculateVolume(exercise);
                    return (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{exercise.exerciseName}</span>
                        <span className="text-gray-400">
                          {exercise.sets.length} sets · {volume.toLocaleString()} kg
                        </span>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-400">No workouts logged this month yet.</p>
        </div>
      )}
    </div>
  );
}
