import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useUser } from '../context/UserContext';
import { useWorkout } from '../context/WorkoutContext';
import { USER_COLORS } from '../types';
import type { UserId } from '../types';
import { WEEKLY_SCHEDULE } from '../data/schedule';
import { calculateVolume, EXERCISE_MUSCLE_MAP } from '../utils/calculations';
import { formatDisplayDate, getDayName } from '../utils/dates';

type ChartView = 'exercise' | 'muscle' | 'compare';

const ABEL_COLORS = USER_COLORS.abel;
const KENENI_COLORS = USER_COLORS.keneni;

export default function ProgressPage() {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];
  const { workoutData } = useWorkout();
  const [chartView, setChartView] = useState<ChartView>('exercise');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedDay, setSelectedDay] = useState('all');

  // Get all unique exercises
  const allExercises = useMemo(() => {
    const set = new Set<string>();
    WEEKLY_SCHEDULE.forEach((day) => {
      day.exercises.forEach((e) => set.add(e.name));
    });
    for (const userId of ['abel', 'keneni'] as UserId[]) {
      const userData = workoutData[userId];
      if (userData) {
        Object.values(userData).forEach((day) => {
          day?.exercises?.forEach((e) => set.add(e.exerciseName));
        });
      }
    }
    return Array.from(set).sort();
  }, [workoutData]);

  // Filter data by selected day
  const filterByDay = (dateKey: string) => {
    if (selectedDay === 'all') return true;
    return getDayName(dateKey) === selectedDay;
  };

  // Single user progress data
  const progressData = useMemo(() => {
    if (!selectedExercise) return [];
    const userData = workoutData[activeUser];
    if (!userData) return [];

    const data: { dateKey: string; display: string; maxWeight: number; totalReps: number; volume: number }[] = [];

    Object.entries(userData).forEach(([dateKey, day]) => {
      if (!filterByDay(dateKey)) return;
      const exercise = day?.exercises?.find((e) => e.exerciseName === selectedExercise);
      if (!exercise || exercise.sets.length === 0) return;

      data.push({
        dateKey,
        display: formatDisplayDate(dateKey),
        maxWeight: Math.max(...exercise.sets.map((s) => s.weightKg)),
        totalReps: exercise.sets.reduce((sum, s) => sum + s.reps, 0),
        volume: calculateVolume(exercise),
      });
    });

    return data.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [selectedExercise, workoutData, activeUser, selectedDay]);

  // Combined comparison data
  const comparisonData = useMemo(() => {
    if (!selectedExercise) return [];
    const getUserData = (userId: UserId) => {
      const userData = workoutData[userId];
      if (!userData) return [];
      const data: { dateKey: string; display: string; maxWeight: number; totalReps: number; volume: number }[] = [];
      Object.entries(userData).forEach(([dateKey, day]) => {
        if (!filterByDay(dateKey)) return;
        const exercise = day?.exercises?.find((e) => e.exerciseName === selectedExercise);
        if (!exercise || exercise.sets.length === 0) return;
        data.push({
          dateKey, display: formatDisplayDate(dateKey),
          maxWeight: Math.max(...exercise.sets.map((s) => s.weightKg)),
          totalReps: exercise.sets.reduce((sum, s) => sum + s.reps, 0),
          volume: calculateVolume(exercise),
        });
      });
      return data.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    };

    const abelData = getUserData('abel');
    const keneniData = getUserData('keneni');
    const merged: Record<string, {
      display: string;
      abelWeight: number; keneniWeight: number;
      abelReps: number; keneniReps: number;
      abelVolume: number; keneniVolume: number;
    }> = {};

    for (const d of abelData) {
      merged[d.dateKey] = { display: d.display, abelWeight: d.maxWeight, abelReps: d.totalReps, abelVolume: d.volume, keneniWeight: 0, keneniReps: 0, keneniVolume: 0 };
    }
    for (const d of keneniData) {
      if (merged[d.dateKey]) {
        merged[d.dateKey].keneniWeight = d.maxWeight;
        merged[d.dateKey].keneniReps = d.totalReps;
        merged[d.dateKey].keneniVolume = d.volume;
      } else {
        merged[d.dateKey] = { display: d.display, keneniWeight: d.maxWeight, keneniReps: d.totalReps, keneniVolume: d.volume, abelWeight: 0, abelReps: 0, abelVolume: 0 };
      }
    }

    return Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)).map(([_, val]) => val);
  }, [selectedExercise, workoutData, selectedDay]);

  // Muscle group data
  const muscleData = useMemo(() => {
    const userData = workoutData[activeUser];
    if (!userData) return [];
    const volumeByGroup: Record<string, number> = {};
    Object.values(userData).forEach((day) => {
      day?.exercises?.forEach((exercise) => {
        const volume = calculateVolume(exercise);
        const groups = EXERCISE_MUSCLE_MAP[exercise.exerciseName] ?? ['Other'];
        groups.forEach((group) => {
          volumeByGroup[group] = (volumeByGroup[group] ?? 0) + volume;
        });
      });
    });
    return Object.entries(volumeByGroup)
      .map(([muscleGroup, volume]) => ({ muscleGroup, volume }))
      .sort((a, b) => b.volume - a.volume);
  }, [workoutData, activeUser]);

  const metrics = [
    { key: 'maxWeight', label: 'Max Weight (kg)', color: '#3B82F6' },
    { key: 'totalReps', label: 'Total Reps', color: '#10B981' },
    { key: 'volume', label: 'Volume (kg)', color: '#F59E0B' },
  ];

  const comparisonMetrics = [
    { abelKey: 'abelWeight', keneniKey: 'keneniWeight', label: 'Max Weight (kg)' },
    { abelKey: 'abelReps', keneniKey: 'keneniReps', label: 'Total Reps' },
    { abelKey: 'abelVolume', keneniKey: 'keneniVolume', label: 'Volume (kg)' },
  ];

  return (
    <div className="space-y-4 page-enter">
      <h2 className="text-lg font-bold text-gray-800">Progress</h2>

      {/* View toggle */}
      <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
        {(['exercise', 'compare', 'muscle'] as ChartView[]).map((view) => (
          <button
            key={view}
            onClick={() => setChartView(view)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              chartView === view ? 'bg-white text-gray-800 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {view === 'exercise' ? 'By Exercise' : view === 'compare' ? 'vs Abel & Keneni' : 'Muscle Groups'}
          </button>
        ))}
      </div>

      {/* Day of week selector (for exercise & compare views) */}
      {(chartView === 'exercise' || chartView === 'compare') && (
        <div className="card">
          <label className="block text-sm font-medium text-gray-500 mb-2">Day of Week</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="input-field text-left"
          >
            <option value="all">All Days</option>
            {WEEKLY_SCHEDULE.filter((d) => !d.isRestDay).map((day) => (
              <option key={day.dayOfWeek} value={day.dayOfWeek}>{day.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Exercise selector (for exercise & compare views) */}
      {(chartView === 'exercise' || chartView === 'compare') && (
        <div className="card">
          <label className="block text-sm font-medium text-gray-500 mb-2">Select Exercise</label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="input-field text-left"
            style={{ borderColor: selectedExercise ? colors.border : undefined }}
          >
            <option value="">Choose an exercise...</option>
            {allExercises.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Exercise View Charts */}
      {chartView === 'exercise' && selectedExercise && progressData.length > 0 && (
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.key} className="card hover:shadow-md transition-shadow duration-300">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">{metric.label}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="display" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Line type="monotone" dataKey={metric.key} stroke={metric.color} strokeWidth={2} dot={{ fill: metric.color, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
      {chartView === 'exercise' && selectedExercise && progressData.length === 0 && (
        <div className="card text-center py-8 animate-fadeIn">
          <p className="text-gray-400">No data yet for this exercise.</p>
          <p className="text-sm text-gray-300 mt-1">Log some workouts to see progress!</p>
        </div>
      )}

      {/* Compare View Charts */}
      {chartView === 'compare' && selectedExercise && comparisonData.length > 0 && (
        <div className="space-y-4">
          {comparisonMetrics.map(({ abelKey, keneniKey, label }) => (
            <div key={abelKey} className="card hover:shadow-md transition-shadow duration-300">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">{label}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="display" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Legend />
                  <Line type="monotone" dataKey={abelKey} stroke={ABEL_COLORS.primary} strokeWidth={2} dot={{ fill: ABEL_COLORS.primary, r: 4 }} name="Abel" />
                  <Line type="monotone" dataKey={keneniKey} stroke={KENENI_COLORS.primary} strokeWidth={2} dot={{ fill: KENENI_COLORS.primary, r: 4 }} name="Keneni" />
                </LineChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Abel Best</p>
                  <p className="text-sm font-bold text-blue-600">
                    {Math.max(...comparisonData.map((d) => Number(d[abelKey as keyof typeof d])), 0)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Keneni Best</p>
                  <p className="text-sm font-bold text-green-600">
                    {Math.max(...comparisonData.map((d) => Number(d[keneniKey as keyof typeof d])), 0)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {chartView === 'compare' && selectedExercise && comparisonData.length === 0 && (
        <div className="card text-center py-8 animate-fadeIn">
          <p className="text-gray-400">No comparison data yet for this exercise.</p>
          <p className="text-sm text-gray-300 mt-1">Both users need to log this exercise to see side-by-side progress!</p>
        </div>
      )}

      {/* Muscle Group View */}
      {chartView === 'muscle' && (
        <>
          {muscleData.length > 0 ? (
            <div className="card hover:shadow-md transition-shadow duration-300">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Total Volume by Muscle Group</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={muscleData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis dataKey="muscleGroup" type="category" tick={{ fontSize: 11, fill: '#6B7280' }} width={90} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }} formatter={(value) => [`${Number(value).toLocaleString()} kg`, 'Volume']} />
                  <Bar dataKey="volume" fill={colors.primary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="card text-center py-8 animate-fadeIn">
              <p className="text-gray-400">No workout data yet.</p>
              <p className="text-sm text-gray-300 mt-1">Log some workouts to see muscle group analysis!</p>
            </div>
          )}
          {muscleData.length > 0 && (
            <div className="card hover:shadow-md transition-shadow duration-300">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Breakdown</h3>
              <div className="space-y-2">
                {muscleData.map((item, i) => {
                  const pct = (item.volume / muscleData[0].volume) * 100;
                  return (
                    <div key={item.muscleGroup} className="animate-slideUp" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{item.muscleGroup}</span>
                        <span className="text-gray-400">{item.volume.toLocaleString()} kg</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, backgroundColor: colors.primary }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
