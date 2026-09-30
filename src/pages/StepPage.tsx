import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Star, Clock, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import { useMemo, useState } from 'react';
import {
  difficultyBadgeClass, isSolved, statusLabel, statusColor, cn,
} from '../lib/utils';
import type { Difficulty, FilterStatus } from '../types';
import ProblemRow from '../components/ProblemRow';

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

type DiffFilter = 'All' | Difficulty;
type StatusFilter = 'all' | 'solved' | 'unsolved' | 'starred';

export default function StepPage() {
  const { stepId } = useParams<{ stepId: string }>();
  const problems = useStore((s) => s.problems);
  const steps = useStore((s) => s.steps);

  const step = steps.find((s: any) => s.id === stepId);
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const stepProblems = useMemo(
    () => Object.values(problems).filter((p) => p.step === stepId),
    [problems, stepId]
  );

  const filtered = useMemo(() => {
    return stepProblems.filter((p) => {
      if (diffFilter !== 'All' && p.difficulty !== diffFilter) return false;
      if (statusFilter === 'solved' && !isSolved(p.status)) return false;
      if (statusFilter === 'unsolved' && isSolved(p.status)) return false;
      if (statusFilter === 'starred' && !p.starred) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [stepProblems, diffFilter, statusFilter, search]);

  const solved = stepProblems.filter((p) => isSolved(p.status)).length;
  const total = stepProblems.length;
  const pct = total ? Math.round((solved / total) * 100) : 0;

  if (!step) {
    return (
      <div className="text-center py-20 text-dark-400">
        <p>Step not found.</p>
        <Link to="/roadmap" className="btn-primary mt-4 inline-flex">Back to Roadmap</Link>
      </div>
    );
  }

  const difficulties: DiffFilter[] = ['All', 'Easy', 'Medium', 'Hard'];
  const statuses: { v: StatusFilter; label: string }[] = [
    { v: 'all', label: 'All' },
    { v: 'solved', label: 'Solved' },
    { v: 'unsolved', label: 'Unsolved' },
    { v: 'starred', label: '⭐ Starred' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link to="/roadmap" className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-dark-200 mb-3">
          <ArrowLeft size={14} /> Back to Roadmap
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-3xl">
              {STEP_ICONS[stepId ?? ''] ?? '📌'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{step.name}</h1>
              <p className="text-dark-400 text-sm mt-0.5">
                {solved} / {total} problems solved • {pct}% complete
              </p>
            </div>
          </div>
        </div>
        <div className="progress-bar h-2 mt-4">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3">
        {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => {
          const count = stepProblems.filter((p) => p.difficulty === d).length;
          const dSolved = stepProblems.filter((p) => p.difficulty === d && isSolved(p.status)).length;
          return (
            <div key={d} className="card px-4 py-2.5 flex items-center gap-2.5">
              <span className={difficultyBadgeClass(d)}>{d}</span>
              <span className="text-sm text-dark-200">{dSolved}/{count}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search problems in this step…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base flex-1"
        />
        <div className="flex gap-1.5 flex-wrap">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                diffFilter === d
                  ? 'bg-brand-600 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-dark-200'
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s.v}
              onClick={() => setStatusFilter(s.v)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                statusFilter === s.v
                  ? 'bg-brand-600 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-dark-200'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Problem list */}
      <div className="card overflow-hidden">
        <div className="border-b border-dark-800 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-dark-300">
            {filtered.length} problems
            {(diffFilter !== 'All' || statusFilter !== 'all' || search) && ' (filtered)'}
          </span>
          <span className="text-xs text-dark-500">Click a problem to open details</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-dark-500 text-sm">No problems match your filters</div>
        ) : (
          <div className="divide-y divide-dark-800/50">
            {filtered.map((p, idx) => (
              <ProblemRow key={p.id} problem={p} index={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
