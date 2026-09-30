import { Link } from 'react-router-dom';
import {
  TrendingUp, Star, RefreshCw, Flame, CheckCircle,
  BookOpen, ArrowRight, Zap,
} from 'lucide-react';
import { useStore, useStats } from '../store';
import { isSolved, statusLabel, statusColor, timeAgo, formatDate } from '../lib/utils';
import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';

const STEP_ICONS: Record<string, string> = {
  'step-1': '📐',
  'step-2': '📊',
  'step-3': '📦',
  'step-4': '🔍',
  'step-5': '🔤',
  'step-6': '🔗',
  'step-7': '🔄',
  'step-8': '⚙️',
  'step-9': '🗂️',
  'step-10': '🪟',
  'step-11': '🏔️',
  'step-12': '🤑',
  'step-13': '🌲',
  'step-14': '🌳',
  'step-15': '🕸️',
  'step-16': '💡',
  'step-17': '🌿',
};

export default function Dashboard() {
  const stats = useStats();
  const steps = useStore((s) => s.steps);
  const settings = useStore((s) => s.settings);

  // ── Array data — derived with useMemo to keep referential stability ─────────
  const allProblems = useStore((s) => s.problems); // stable ref (plain object)

  const starred = useMemo(
    () => Object.values(allProblems).filter((p) => p.starred),
    [allProblems]
  );

  const revisionDue = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return Object.values(allProblems).filter(
      (p) => p.nextReviewDate && p.nextReviewDate <= today
    );
  }, [allProblems]);

  const recentProblems = useMemo(
    () =>
      Object.values(allProblems)
        .filter((p) => p.lastAttempted)
        .sort((a, b) => new Date(b.lastAttempted!).getTime() - new Date(a.lastAttempted!).getTime())
        .slice(0, 8),
    [allProblems]
  );

  // Step-wise progress
  const stepData = useMemo(
    () =>
      (steps as any[]).map((step) => {
        const stepProbs = Object.values(allProblems).filter((p) => p.step === step.id);
        const solved = stepProbs.filter((p) => isSolved(p.status)).length;
        return {
          id: step.id,
          name: step.name,
          solved,
          total: stepProbs.length,
          pct: stepProbs.length ? Math.round((solved / stepProbs.length) * 100) : 0,
        };
      }),
    [steps, allProblems]
  );

  // Difficulty split
  const diffData = useMemo(() => {
    const all = Object.values(allProblems);
    return [
      { name: 'Easy', value: all.filter((p) => p.difficulty === 'Easy').length, color: '#10b981' },
      { name: 'Medium', value: all.filter((p) => p.difficulty === 'Medium').length, color: '#f59e0b' },
      { name: 'Hard', value: all.filter((p) => p.difficulty === 'Hard').length, color: '#ef4444' },
    ];
  }, [allProblems]);

  const solvedPct = stats.total ? Math.round((stats.solved / stats.total) * 100) : 0;

  const tooltipStyle = {
    contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 },
  };

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="hero-gradient -mx-4 sm:-mx-6 -mt-6 px-4 sm:px-6 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back! 👋</h1>
            <p className="text-dark-400 mt-1 text-sm">
              {revisionDue.length > 0
                ? `You have ${revisionDue.length} problem${revisionDue.length > 1 ? 's' : ''} due for revision today.`
                : 'Keep up the momentum — you\'re doing great!'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/problems" className="btn-primary text-sm">
              <Zap size={14} /> Continue Learning
            </Link>
            <Link to="/revision" className="btn-secondary text-sm">
              <RefreshCw size={14} /> Revise Now
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<CheckCircle size={18} className="text-emerald-400" />}
          label="Solved" value={stats.solved} sub={`of ${stats.total}`} color="text-emerald-400"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-amber-400" />}
          label="Attempted" value={stats.attempted} sub="problems" color="text-amber-400"
        />
        <StatCard
          icon={<Star size={18} className="text-brand-400" />}
          label="Starred" value={stats.starred} sub="for review" color="text-brand-400"
        />
        <StatCard
          icon={<Flame size={18} className="text-orange-400" />}
          label="Streak" value={settings.streakDays} sub="days" color="text-orange-400"
        />
      </div>

      {/* Overall progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-white">Overall Progress</h2>
            <p className="text-xs text-dark-400 mt-0.5">
              {solvedPct}% complete — {stats.solved} / {stats.total} problems
            </p>
          </div>
          <Link to="/analytics" className="btn-ghost text-xs">
            Full analytics <ArrowRight size={12} />
          </Link>
        </div>
        <div className="progress-bar h-3">
          <div className="progress-fill" style={{ width: `${solvedPct}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Not Started', value: stats.notStarted, cls: 'text-dark-400' },
            { label: 'Attempted', value: stats.attempted, cls: 'text-amber-400' },
            { label: 'Solved', value: stats.solved, cls: 'text-emerald-400' },
            { label: 'Need Revision', value: stats.needsRevision, cls: 'text-orange-400' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-xl font-bold ${item.cls}`}>{item.value}</div>
              <div className="text-xs text-dark-500 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Step progress */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Step-wise Progress</h2>
            <Link to="/roadmap" className="btn-ghost text-xs">
              Full roadmap <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {stepData.slice(0, 10).map((s) => (
              <Link key={s.id} to={`/roadmap/${s.id}`} className="block group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-dark-300 group-hover:text-white transition-colors truncate pr-2">
                    {STEP_ICONS[s.id] ?? '📌'} {s.name}
                  </span>
                  <span className="text-dark-400 shrink-0">{s.solved}/{s.total}</span>
                </div>
                <div className="progress-bar h-1.5">
                  <div className="progress-fill" style={{ width: `${s.pct}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Difficulty distribution */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Difficulty Split</h2>
          <div className="flex justify-center">
            <ResponsiveContainer width={180} height={160}>
              <PieChart>
                <Pie data={diffData} cx={90} cy={80} innerRadius={45} outerRadius={70}
                  paddingAngle={3} dataKey="value">
                  {diffData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v: any, n: any) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {diffData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-dark-300">{d.name}</span>
                </div>
                <span className="text-dark-400">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent activity */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <Link to="/problems" className="btn-ghost text-xs">All problems</Link>
          </div>
          {recentProblems.length === 0 ? (
            <div className="text-center py-8 text-dark-500 text-sm">
              <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
              No activity yet — start solving problems!
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentProblems.map((p) => (
                <Link
                  key={p.id}
                  to={`/problems/${p.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-dark-800 transition-colors"
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isSolved(p.status) ? 'bg-emerald-400' :
                    p.status === 'attempted' ? 'bg-amber-400' : 'bg-dark-500'
                  }`} />
                  <span className="text-sm text-dark-200 truncate flex-1">{p.title}</span>
                  <span className="text-xs text-dark-500 shrink-0">{timeAgo(p.lastAttempted)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Starred & Revision panels */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Star size={14} className="text-amber-400" /> Starred
              </h2>
              <Link to="/starred" className="btn-ghost text-xs">View all</Link>
            </div>
            {starred.length === 0 ? (
              <p className="text-sm text-dark-500 py-3 text-center">No starred problems yet</p>
            ) : (
              <div className="space-y-1">
                {starred.slice(0, 4).map((p) => (
                  <Link key={p.id} to={`/problems/${p.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-800 transition-colors">
                    <span className="text-xs text-dark-200 truncate flex-1">{p.title}</span>
                    <span className={`text-xs ${statusColor(p.status)} shrink-0`}>
                      {statusLabel(p.status)}
                    </span>
                  </Link>
                ))}
                {starred.length > 4 && (
                  <p className="text-xs text-dark-500 pt-1 px-2">+{starred.length - 4} more</p>
                )}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <RefreshCw size={14} className="text-orange-400" /> Revision Due
              </h2>
              <Link to="/revision" className="btn-ghost text-xs">All due</Link>
            </div>
            {revisionDue.length === 0 ? (
              <p className="text-sm text-dark-500 py-3 text-center">Nothing due today 🎉</p>
            ) : (
              <div className="space-y-1">
                {revisionDue.slice(0, 4).map((p) => (
                  <Link key={p.id} to={`/problems/${p.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-800 transition-colors">
                    <span className="text-xs text-dark-200 truncate flex-1">{p.title}</span>
                    <span className="text-xs text-orange-400 shrink-0">
                      {formatDate(p.nextReviewDate)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode; label: string; value: number; sub: string; color: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        {icon}
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
      </div>
      <div className="mt-1">
        <div className="text-sm font-medium text-dark-200">{label}</div>
        <div className="text-xs text-dark-500">{sub}</div>
      </div>
    </div>
  );
}
