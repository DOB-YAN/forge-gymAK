import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/UserContext';
import { useBody } from '../context/BodyContext';
import { USER_COLORS } from '../types';
import { formatDisplayDate } from '../utils/dates';

export default function BodyPage() {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];
  const { saveMetrics, getAllMetrics } = useBody();

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [saved, setSaved] = useState(false);

  // Get last saved metrics
  const allMetrics = getAllMetrics(activeUser);

  const chartData = useMemo(() => {
    return allMetrics
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map((m) => ({
        display: formatDisplayDate(m.dateKey),
        weight: m.weightKg,
        height: m.heightCm,
      }));
  }, [allMetrics]);

  const latestMetrics = allMetrics.length > 0
    ? allMetrics.reduce((a, b) => a.dateKey > b.dateKey ? a : b)
    : null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) return;
    saveMetrics(activeUser, w, h);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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

      {/* Log form */}
      <form onSubmit={handleSave} className="card">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Log Today's Measurements</h3>
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
          {saved ? '✓ Saved!' : 'Save Measurements'}
        </button>
      </form>

      {/* Weight trend chart */}
      {chartData.length >= 2 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Weight Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="display"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ fill: colors.primary, r: 4 }}
                activeDot={{ r: 6 }}
                name="Weight (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Height trend chart */}
      {chartData.length >= 2 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Height Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="display"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="height"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Height (cm)"
              />
            </LineChart>
          </ResponsiveContainer>
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
