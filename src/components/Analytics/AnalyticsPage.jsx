import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Leaf, DollarSign, TrendingUp, Award } from 'lucide-react';
import { getActivityLog } from '../../services/storage';
import { CATEGORIES } from '../../data/categories';
import Header from '../Layout/Header';

const CHART_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#6366f1', '#06b6d4', '#a78bfa'];

// Estimated average price per item in INR
const AVG_PRICE = 45;

export default function AnalyticsPage({ inventory }) {
  const activityLog = getActivityLog();

  const stats = useMemo(() => {
    const used = activityLog.filter(a => a.action === 'used');
    const wasted = activityLog.filter(a => a.action === 'wasted');
    const total = used.length + wasted.length;
    const savedPct = total > 0 ? Math.round((used.length / total) * 100) : 100;
    const moneySaved = used.length * AVG_PRICE;
    const moneyWasted = wasted.length * AVG_PRICE;
    const co2Saved = (used.length * 0.5).toFixed(1); // ~500g CO2 per item saved

    return { used, wasted, total, savedPct, moneySaved, moneyWasted, co2Saved };
  }, [activityLog]);

  // Category breakdown of wasted items
  const wasteByCategory = useMemo(() => {
    const wasted = activityLog.filter(a => a.action === 'wasted');
    const counts = {};
    wasted.forEach(a => {
      counts[a.itemCategory] = (counts[a.itemCategory] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({
      name: CATEGORIES.find(c => c.id === cat)?.label || cat,
      value: count,
      emoji: CATEGORIES.find(c => c.id === cat)?.emoji || '🍽️',
    })).sort((a, b) => b.value - a.value);
  }, [activityLog]);

  // Weekly trend (last 7 days)
  const weeklyTrend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-IN', { weekday: 'short' });
      const dayActivity = activityLog.filter(a => a.timestamp.startsWith(dateStr));
      days.push({
        day: dayLabel,
        saved: dayActivity.filter(a => a.action === 'used').length,
        wasted: dayActivity.filter(a => a.action === 'wasted').length,
      });
    }
    return days;
  }, [activityLog]);

  const pieData = [
    { name: 'Saved', value: stats.used.length, color: '#22c55e' },
    { name: 'Wasted', value: stats.wasted.length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const getGrade = (pct) => {
    if (pct >= 90) return { grade: 'A+', label: 'Outstanding!', color: '#22c55e' };
    if (pct >= 80) return { grade: 'A', label: 'Excellent', color: '#22c55e' };
    if (pct >= 70) return { grade: 'B', label: 'Good', color: '#4ade80' };
    if (pct >= 60) return { grade: 'C', label: 'Average', color: '#f59e0b' };
    return { grade: 'D', label: 'Needs Work', color: '#ef4444' };
  };

  const grade = getGrade(stats.savedPct);

  return (
    <div className="fade-in">
      <Header title="Analytics" subtitle="Track your food waste reduction journey" />

      <div className="page-content">
        {/* Top Stats */}
        <div className="stats-grid mb-24 stagger-in">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <Leaf size={22} style={{ color: 'var(--green-400)' }} />
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--green-400)' }}>{stats.used.length}</div>
              <div className="stat-label">Items Saved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <span style={{ fontSize: 22 }}>❌</span>
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--status-urgent)' }}>{stats.wasted.length}</div>
              <div className="stat-label">Items Wasted</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <DollarSign size={22} style={{ color: 'var(--green-400)' }} />
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--green-400)' }}>₹{stats.moneySaved}</div>
              <div className="stat-label">Money Saved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <span style={{ fontSize: 22 }}>🌍</span>
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--indigo-400)' }}>{stats.co2Saved}kg</div>
              <div className="stat-label">CO₂ Saved</div>
            </div>
          </div>
        </div>

        {activityLog.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">No data yet</div>
            <div className="empty-state-desc">
              Start adding groceries and marking items as used or wasted to see your analytics!
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Grade + Pie */}
            <div className="grid-2">
              {/* Waste Reduction Grade */}
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
                  <Award size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--green-400)' }} />
                  Waste Reduction Grade
                </div>
                <div style={{
                  fontSize: 72, fontWeight: 900, color: grade.color,
                  lineHeight: 1, marginBottom: 8,
                  textShadow: `0 0 40px ${grade.color}40`,
                }}>
                  {grade.grade}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: grade.color, marginBottom: 4 }}>
                  {grade.label}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {stats.savedPct}% food saved from waste
                </div>
                <div className="progress-bar" style={{ marginTop: 20 }}>
                  <div className="progress-fill" style={{
                    width: `${stats.savedPct}%`,
                    background: `linear-gradient(90deg, ${grade.color}, ${grade.color}99)`,
                  }} />
                </div>
              </div>

              {/* Pie Chart */}
              <div className="card">
                <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
                  🥧 Saved vs Wasted
                </div>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Items']} contentStyle={{ background: '#1a1a3a', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    No data yet
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Trend */}
            <div className="card">
              <div style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>
                📈 7-Day Activity Trend
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyTrend} barGap={4}>
                  <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#0d0d24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="saved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Saved" />
                  <Bar dataKey="wasted" fill="#ef4444" radius={[4, 4, 0, 0]} name="Wasted" />
                  <Legend formatter={(v) => <span style={{ color: '#94a3b8' }}>{v}</span>} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Waste by Category */}
            {wasteByCategory.length > 0 && (
              <div className="card">
                <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
                  🗂️ Most Wasted Categories
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {wasteByCategory.slice(0, 6).map((cat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 18, width: 24 }}>{cat.emoji}</span>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{cat.name}</span>
                      <div className="progress-bar" style={{ flex: 2 }}>
                        <div className="progress-fill" style={{
                          width: `${(cat.value / wasteByCategory[0].value) * 100}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }} />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 30, textAlign: 'right' }}>
                        {cat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eco Impact */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(99,102,241,0.05))',
              border: '1px solid rgba(34,197,94,0.2)',
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                🌍 Environmental Impact
              </div>
              <div className="grid-3">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>♻️</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-400)' }}>{stats.co2Saved} kg</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>CO₂ emissions saved</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>💧</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--indigo-400)' }}>{(stats.used.length * 50).toLocaleString()} L</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Water saved</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>💰</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>₹{stats.moneySaved}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Money saved</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
