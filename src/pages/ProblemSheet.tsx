import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { isSolved, cn, difficultyBadgeClass } from '../lib/utils';
import ProblemRow from '../components/ProblemRow';
import type { Difficulty } from '../types';
import { Filter, SortAsc, RotateCcw, ChevronDown } from 'lucide-react';

type DiffFilter = 'All' | Difficulty;
type StatusFilter = 'all' | 'not-started' | 'attempted' | 'solved' | 'starred' | 'needs-revision';
type SortBy = 'roadmap' | 'title' | 'difficulty' | 'status';

export default function ProblemSheet() {
  const problems = useStore((s) => s.problems);
  const steps = useStore((s) => s.steps);
  const [search, setSearch] = useState('');
  const [diff, setDiff] = useState<DiffFilter>('All');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [step, setStep] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('roadmap');
  const [starred, setStarred] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const allProblems = useMemo(() => Object.values(problems), [problems]);

  const filtered = useMemo(() => {
    let list = allProblems;
    if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (diff !== 'All') list = list.filter((p) => p.difficulty === diff);
    if (step !== 'all') list = list.filter((p) => p.step === step);
    if (starred) list = list.filter((p) => p.starred);
    if (status === 'solved') list = list.filter((p) => isSolved(p.status));
    else if (status === 'not-started') list = list.filter((p) => p.status === 'not-started');
    else if (status === 'attempted') list = list.filter((p) => p.status === 'attempted');
    else if (status === 'starred') list = list.filter((p) => p.starred);
    else if (status === 'needs-revision') list = list.filter((p) => p.status === 'needs-revision');

    // Sort
    if (sortBy === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'difficulty') {
      const ord: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2, Unclassified: 3 };
      list = [...list].sort((a, b) => ord[a.difficulty] - ord[b.difficulty]);
    } else if (sortBy === 'status') {
      const ord: Record<string, number> = {
        'not-started': 0, 'attempted': 1, 'needs-revision': 2,
        'solved-after-solution': 3, 'solved-hints': 4, 'solved-independent': 5,
      };
      list = [...list].sort((a, b) => ord[a.status] - ord[b.status]);
    }
    // roadmap = natural order (num)
    return list;
  }, [allProblems, search, diff, step, status, starred, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reset = () => {
    setSearch(''); setDiff('All'); setStatus('all');
    setStep('all'); setStarred(false); setSortBy('roadmap'); setPage(1);
  };

  const stats = useMemo(() => ({
    solved: allProblems.filter((p) => isSolved(p.status)).length,
    total: allProblems.length,
    easy: allProblems.filter((p) => p.difficulty === 'Easy').length,
    medium: allProblems.filter((p) => p.difficulty === 'Medium').length,
    hard: allProblems.filter((p) => p.difficulty === 'Hard').length,
  }), [allProblems]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Problem Sheet</h1>
        <p className="text-dark-400 text-sm mt-1">
          {stats.solved} / {stats.total} solved •
          <span className="text-emerald-400 ml-1">{stats.easy} Easy</span> •
          <span className="text-amber-400 ml-1">{stats.medium} Medium</span> •
          <span className="text-red-400 ml-1">{stats.hard} Hard</span>
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            placeholder="Search all problems…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base flex-1"
          />
          <select
            value={step}
            onChange={(e) => { setStep(e.target.value); setPage(1); }}
            className="input-base sm:w-52"
          >
            <option value="all">All Steps</option>
            {steps.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Difficulty */}
          {(['All', 'Easy', 'Medium', 'Hard'] as DiffFilter[]).map((d) => (
            <button key={d} onClick={() => { setDiff(d); setPage(1); }}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                diff === d ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200')}>
              {d}
            </button>
          ))}
          <div className="w-px h-5 bg-dark-700 mx-1" />
          {/* Status */}
          {([
            { v: 'all', label: 'All Status' },
            { v: 'not-started', label: 'Not Started' },
            { v: 'attempted', label: 'Attempted' },
            { v: 'solved', label: 'Solved' },
            { v: 'needs-revision', label: 'Needs Revision' },
          ] as { v: StatusFilter; label: string }[]).map((s) => (
            <button key={s.v} onClick={() => { setStatus(s.v); setPage(1); }}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                status === s.v ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200')}>
              {s.label}
            </button>
          ))}
          <div className="w-px h-5 bg-dark-700 mx-1" />
          <button onClick={() => { setStarred(!starred); setPage(1); }}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              starred ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-dark-800 text-dark-400 hover:text-dark-200')}>
            ⭐ Starred
          </button>
          <div className="ml-auto flex gap-2 items-center">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="input-base text-xs py-1.5 w-auto">
              <option value="roadmap">Sort: Roadmap</option>
              <option value="title">Sort: A-Z</option>
              <option value="difficulty">Sort: Difficulty</option>
              <option value="status">Sort: Status</option>
            </select>
            <button onClick={reset} className="btn-ghost text-xs py-1.5">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="border-b border-dark-800 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-dark-400">
            Showing {pageItems.length} of {filtered.length} problems
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-sm">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="btn-ghost text-xs py-1 disabled:opacity-40">Prev</button>
              <span className="text-dark-500">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="btn-ghost text-xs py-1 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 border-b border-dark-800/50 text-xs text-dark-500 uppercase tracking-wide">
          <span className="w-7 shrink-0">#</span>
          <span className="w-4 shrink-0"></span>
          <span className="flex-1">Problem</span>
          <span className="w-28 hidden lg:block">Step</span>
          <span className="w-16">Diff</span>
          <span className="w-32">Status</span>
          <span className="w-6"></span>
          <span className="w-6"></span>
        </div>

        {pageItems.length === 0 ? (
          <div className="py-16 text-center text-dark-500 text-sm">
            No problems match your filters
          </div>
        ) : (
          <div className="divide-y divide-dark-800/40">
            {pageItems.map((p, i) => (
              <ProblemRow key={p.id} problem={p} index={(page - 1) * PAGE_SIZE + i + 1} showStep />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((pg) => (
            <button key={pg} onClick={() => setPage(pg)}
              className={cn('w-8 h-8 rounded text-xs font-medium transition-colors',
                page === pg ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200')}>
              {pg}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
