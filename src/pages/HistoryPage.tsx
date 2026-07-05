import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useUser } from '../context/UserContext';
import { useWorkout } from '../context/WorkoutContext';
import { USER_COLORS } from '../types';
import type { UserId } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { calculateVolume } from '../utils/calculations';

const DAYS_30 = 30;

export default function HistoryPage() {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];
  const { workoutData } = useWorkout();
  const [selectedUser, setSelectedUser] = useState<'all' | UserId>('all');

  // Generate last 30 days
  const last30Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = DAYS_30 - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      days.push(`${y}-${m}-${d}`);
    }
    return days;
  }, []);

  // Get workouts for both users
  const historyEntries = useMemo(() => {
    const users: UserId[] = selectedUser === 'all' ? ['abel', 'keneni'] : [selectedUser];
    const entries: {
      dateKey: string;
      display: string;
      userId: UserId;
      exercises: { name: string; volume: number; sets: number }[];
      totalVolume: number;
    }[] = [];

    for (const dateKey of last30Days) {
      for (const userId of users) {
        const day = workoutData[userId]?.[dateKey];
        if (!day?.exercises?.length) continue;

        entries.push({
          dateKey,
          display: formatDisplayDate(dateKey),
          userId,
          exercises: day.exercises.map((e) => ({
            name: e.exerciseName,
            volume: calculateVolume(e),
            sets: e.sets.length,
          })),
          totalVolume: day.exercises.reduce((sum, e) => sum + calculateVolume(e), 0),
        });
      }
    }

    return entries.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [selectedUser, workoutData, last30Days]);

  // Volume trend data
  const volumeTrend = useMemo(() => {
    const trendMap: Record<string, { display: string; abelVolume: number; keneniVolume: number }> = {};

    for (const dateKey of last30Days) {
      const display = formatDisplayDate(dateKey);
      const abelDay = workoutData['abel']?.[dateKey];
      const keneniDay = workoutData['keneni']?.[dateKey];

      trendMap[dateKey] = {
        display,
        abelVolume: abelDay?.exercises?.reduce((sum, e) => sum + calculateVolume(e), 0) ?? 0,
        keneniVolume: keneniDay?.exercises?.reduce((sum, e) => sum + calculateVolume(e), 0) ?? 0,
      };
    }

    return Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, val]) => val);
  }, [workoutData, last30Days]);

  const totalWorkouts = historyEntries.length;
  const totalVolume = historyEntries.reduce((sum, e) => sum + e.totalVolume, 0);

  return (
    <div className="space-y-4 page-enter">
      <h2 className="text-lg font-bold text-gray-800">History</h2>

      {/* User filter */}
      <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
        {(['all', 'abel', 'keneni'] as const).map((user) => (
          <button
            key={user}
            onClick={() => setSelectedUser(user)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              selectedUser === user
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={{
              color: selectedUser === user && user !== 'all'
                ? USER_COLORS[user].primary : undefined,
            }}
          >
            {user === 'all' ? 'Both' : user.charAt(0).toUpperCase() + user.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Workouts</p>
          <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>
            {totalWorkouts}
          </p>
          <p className="text-[10px] text-gray-400">Last 30 days</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Volume</p>
          <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>
            {totalVolume.toLocaleString()}
            <span className="text-sm text-gray-400 ml-1">kg</span>
          </p>
        </div>
      </div>

      {/* Volume trend chart */}
      {volumeTrend.some((d) => d.abelVolume > 0 || d.keneniVolume > 0) && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Daily Volume Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={volumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="display" tick={{ fontSize: 9, fill: '#9CA3AF' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
              <Legend />
              <Line type="monotone" dataKey="abelVolume" stroke={USER_COLORS.abel.primary} strokeWidth={2} dot={false} name="Abel" />
              <Line type="monotone" dataKey="keneniVolume" stroke={USER_COLORS.keneni.primary} strokeWidth={2} dot={false} name="Keneni" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily entries */}
      {historyEntries.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500">Workout Log</h3>
          {historyEntries.map((entry, idx) => {
            const userColor = USER_COLORS[entry.userId];
            return (
              <details key={`${entry.dateKey}-${entry.userId}-${idx}`} className="card group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: userColor.primary }}
                      />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {entry.display}
                        </p>
                        <p className="text-[10px] font-medium capitalize" style={{ color: userColor.primary }}>
                          {entry.userId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: userColor.primary }}>
                        {entry.totalVolume.toLocaleString()} kg
                      </p>
                      <p className="text-xs text-gray-400">
                        {entry.exercises.length} exercises
                      </p>
                    </div>
                  </div>
                </summary>
                <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                  {entry.exercises.map((ex, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{ex.name}</span>
                      <span className="text-gray-400">
                        {ex.sets} sets · {ex.volume.toLocaleString()} kg
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-400">No workouts logged in the last 30 days.</p>
        </div>
      )}
    </div>
  );
}
