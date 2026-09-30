import { useMemo } from 'react';
import { useStore, useStats } from '../store';
import { isSolved } from '../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

export default function AnalyticsPage() {
  const stats = useStats();
  const steps = useStore((s) => s.steps);
  const settings = useStore((s) => s.settings);
  const allProblems = useStore((s) => s.problems); // stable object ref

  const all = useMemo(() => Object.values(allProblems), [allProblems]);

  const detailedStats = useMemo(() => ({
    easy: {
      total: all.filter((p) => p.difficulty === 'Easy').length,
      solved: all.filter((p) => p.difficulty === 'Easy' && isSolved(p.status)).length,
    },
    medium: {
      total: all.filter((p) => p.difficulty === 'Medium').length,
      solved: all.filter((p) => p.difficulty === 'Medium' && isSolved(p.status)).length,
    },
    hard: {
      total: all.filter((p) => p.difficulty === 'Hard').length,
      solved: all.filter((p) => p.difficulty === 'Hard' && isSolved(p.status)).length,
    },
  }), [all]);

  const stepData = useMemo(
    () =>
      (steps as any[]).map((step) => {
        const sp = all.filter((p) => p.step === step.id);
        return {
          name: step.name.split(' ').slice(0, 2).join(' ').slice(0, 14),
          fullName: step.name,
          total: sp.length,
          solved: sp.filter((p) => isSolved(p.status)).length,
          attempted: sp.filter((p) => p.status === 'attempted').length,
        };
      }),
    [steps, all]
  );

  const radarData = useMemo(
    () =>
      stepData.slice(0, 8).map((s) => ({
        topic: s.name,
        progress: s.total ? Math.round((s.solved / s.total) * 100) : 0,
      })),
    [stepData]
  );

  const statusData = useMemo(
    () =>
      [
        { name: 'Not Started', value: stats.notStarted, color: '#475569' },
        { name: 'Attempted', value: stats.attempted, color: '#f59e0b' },
        { name: 'Needs Revision', value: stats.needsRevision, color: '#f97316' },
        { name: 'Solved', value: stats.solved, color: '#10b981' },
      ].filter((d) => d.value > 0),
    [stats]
  );

  const tooltipStyle = {
    contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 },
    labelStyle: { color: '#94a3b8' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-dark-400 text-sm mt-1">Track your progress and learning patterns</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Problems', value: stats.total, color: 'text-dark-200' },
          { label: 'Solved', value: stats.solved, color: 'text-emerald-400' },
          { label: 'Completion', value: `${stats.total ? Math.round((stats.solved / stats.total) * 100) : 0}%`, color: 'text-brand-400' },
          { label: 'Study Streak', value: `${settings.streakDays}d`, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-dark-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Step bar chart */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Progress by Step</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stepData} margin={{ top: 0, right: 0, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} angle={-40}
                textAnchor="end" interval={0} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="solved" fill="#10b981" name="Solved" radius={[3, 3, 0, 0]} />
              <Bar dataKey="attempted" fill="#f59e0b" name="Attempted" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Problem Status</h2>
          <div className="flex justify-center">
            <ResponsiveContainer width={240} height={200}>
              <PieChart>
                <Pie data={statusData} cx={120} cy={100} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-dark-400 truncate">{d.name}</span>
                <span className="text-dark-300 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Difficulty Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Easy', data: detailedStats.easy, color: '#10b981', badge: 'badge-easy' },
              { label: 'Medium', data: detailedStats.medium, color: '#f59e0b', badge: 'badge-medium' },
              { label: 'Hard', data: detailedStats.hard, color: '#ef4444', badge: 'badge-hard' },
            ].map((d) => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={d.badge}>{d.label}</span>
                  <span className="text-xs text-dark-400">{d.data.solved} / {d.data.total}</span>
                </div>
                <div className="progress-bar h-2">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${d.data.total ? (d.data.solved / d.data.total) * 100 : 0}%`,
                      background: d.color,
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Topic Coverage (first 8 steps)</h2>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="topic" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Progress" dataKey="progress" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v}%`, 'Progress']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
