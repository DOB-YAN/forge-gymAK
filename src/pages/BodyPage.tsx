import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useUser } from '../context/UserContext';
import { useBody } from '../context/BodyContext';
import { USER_COLORS } from '../types';
import type { UserId } from '../types';
import { formatDisplayDate } from '../utils/dates';

export default function BodyPage() {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];
  const { saveMetrics, getAllMetrics } = useBody();
  const [showBoth, setShowBoth] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [saved, setSaved] = useState(false);

  const allMetrics = getAllMetrics(activeUser);

  const chartData = useMemo(() => {
    if (showBoth) {
      const abelData = getAllMetrics('abel');
      const keneniData = getAllMetrics('keneni');
      const dateKeys = new Set([...abelData, ...keneniData].map((m) => m.dateKey));
      return Array.from(dateKeys).sort().map((dateKey) => {
        const abel = abelData.find((m) => m.dateKey === dateKey);
        const keneni = keneniData.find((m) => m.dateKey === dateKey);
        return {
          display: formatDisplayDate(dateKey),
          abelWeight: abel?.weightKg ?? null,
          abelHeight: abel?.heightCm ?? null,
          keneniWeight: keneni?.weightKg ?? null,
          keneniHeight: keneni?.heightCm ?? null,
        };
      });
    }
    return allMetrics
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map((m) => ({
        display: formatDisplayDate(m.dateKey),
        weight: m.weightKg,
        height: m.heightCm,
        abelWeight: null as number | null,
        abelHeight: null as number | null,
        keneniWeight: null as number | null,
        keneniHeight: null as number | null,
      }));
  }, [allMetrics, showBoth, getAllMetrics]);

  const latestMetrics = allMetrics.length > 0
    ? allMetrics.reduce((a, b) => a.dateKey > b.dateKey ? a : b)
    : null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) return;
    saveMetrics(activeUser, w, h);
    setWeight('');
    setHeight('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (userId: UserId, dateKey: string) => {
    // Remove from localStorage directly
    const key = 'forge_gym_body_metrics';
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        if (data[userId]) {
          delete data[userId][dateKey];
          localStorage.setItem(key, JSON.stringify(data));
          window.location.reload();
        }
      }
    } catch {}
  };

  const userMetrics = useMemo(() => {
    const userIds: UserId[] = showBoth ? ['abel', 'keneni'] : [activeUser];
    const entries: { userId: UserId; dateKey: string; display: string; weightKg: number; heightCm: number }[] = [];
    for (const uid of userIds) {
      const metrics = getAllMetrics(uid);
      metrics.forEach((m) => {
        entries.push({
          userId: uid,
          dateKey: m.dateKey,
          display: formatDisplayDate(m.dateKey),
          weightKg: m.weightKg,
          heightCm: m.heightCm,
        });
      });
    }
    return entries.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [activeUser, showBoth, getAllMetrics]);

  return (
    <div className="space-y-4 page-enter">
      <h2 className="text-lg font-bold text-gray-800">Body Metrics</h2>

      {/* Quick stats */}
      {latestMetrics && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current Weight</p>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>
              {latestMetrics.weightKg}
              <span className="text-sm text-gray-400 ml-1">kg</span>
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Height</p>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>
              {latestMetrics.heightCm}
              <span className="text-sm text-gray-400 ml-1">cm</span>
            </p>
          </div>
        </div>
      )}

      {/* Toggle both users */}
      <div className="flex items-center justify-between card">
        <span className="text-sm font-medium text-gray-500">Show both users</span>
        <button
          onClick={() => setShowBoth(!showBoth)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            showBoth ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              showBoth ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {/* Log form */}
      <form onSubmit={handleSave} className="card">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Log {activeUser.charAt(0).toUpperCase() + activeUser.slice(1)}'s Measurements</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              step={0.1}
              min={0}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="75.0"
              className="input-field text-center"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Height (cm)</label>
            <input
              type="number"
              inputMode="decimal"
              step={0.1}
              min={0}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="175"
              className="input-field text-center"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary w-full"
          style={{ backgroundColor: colors.primary }}
          disabled={!weight || !height}
        >
          {saved ? '✓ Saved!' : 'Add Metric'}
        </button>
      </form>

      {chartData.length >= 2 && (
        <>
          {/* Weight trend chart */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Weight Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="display" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                {showBoth ? (
                  <>
                    <Legend />
                    <Line type="monotone" dataKey="abelWeight" stroke={USER_COLORS.abel.primary} strokeWidth={2} dot={{ fill: USER_COLORS.abel.primary, r: 4 }} name="Abel" connectNulls />
                    <Line type="monotone" dataKey="keneniWeight" stroke={USER_COLORS.keneni.primary} strokeWidth={2} dot={{ fill: USER_COLORS.keneni.primary, r: 4 }} name="Keneni" connectNulls />
                  </>
                ) : (
                  <Line type="monotone" dataKey="weight" stroke={colors.primary} strokeWidth={2} dot={{ fill: colors.primary, r: 4 }} activeDot={{ r: 6 }} name="Weight (kg)" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Height trend chart */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Height Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="display" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                {showBoth ? (
                  <>
                    <Legend />
                    <Line type="monotone" dataKey="abelHeight" stroke={USER_COLORS.abel.primary} strokeWidth={2} dot={{ fill: USER_COLORS.abel.primary, r: 4 }} name="Abel" connectNulls />
                    <Line type="monotone" dataKey="keneniHeight" stroke={USER_COLORS.keneni.primary} strokeWidth={2} dot={{ fill: USER_COLORS.keneni.primary, r: 4 }} name="Keneni" connectNulls />
                  </>
                ) : (
                  <Line type="monotone" dataKey="height" stroke={colors.primary} strokeWidth={2} dot={{ fill: colors.primary, r: 4 }} activeDot={{ r: 6 }} name="Height (cm)" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Entries list */}
      {userMetrics.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">History</h3>
          <div className="space-y-1">
            {userMetrics.map((entry, i) => {
              const entryColor = USER_COLORS[entry.userId];
              return (
                <div key={`${entry.dateKey}-${entry.userId}-${i}`} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 group">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entryColor.primary }} />
                    <span className="text-xs text-gray-400">{entry.display}</span>
                    <span className="text-xs font-medium capitalize" style={{ color: entryColor.primary }}>
                      {entry.userId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{entry.weightKg} kg</span>
                    <span className="text-sm text-gray-400">{entry.heightCm} cm</span>
                    <button
                      onClick={() => handleDelete(entry.userId, entry.dateKey)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {chartData.length < 2 && (
        <div className="card text-center py-8">
          <p className="text-gray-400">Log at least 2 measurements to see trends.</p>
        </div>
      )}
    </div>
  );
}
