import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search } from 'lucide-react';
import { useStore } from '../store';
import ProblemRow from '../components/ProblemRow';
import { cn, isSolved } from '../lib/utils';
import type { Difficulty } from '../types';

export default function StarredPage() {
  const allProblems = useStore((s) => s.problems); // stable object ref
  const steps = useStore((s) => s.steps);
  const [search, setSearch] = useState('');
  const [diff, setDiff] = useState<'All' | Difficulty>('All');
  const [step, setStep] = useState('all');
  const [showSolved, setShowSolved] = useState(true);

  // Stable derived list
  const starred = useMemo(
    () => Object.values(allProblems).filter((p) => p.starred),
    [allProblems]
  );

  const filtered = useMemo(() => {
    return starred.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (diff !== 'All' && p.difficulty !== diff) return false;
      if (step !== 'all' && p.step !== step) return false;
      if (!showSolved && isSolved(p.status)) return false;
      return true;
    });
  }, [starred, search, diff, step, showSolved]);

  const solvedCount = useMemo(() => starred.filter((p) => isSolved(p.status)).length, [starred]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Star size={22} className="text-amber-400" fill="currentColor" /> Starred Questions
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          {starred.length} starred • {solvedCount} solved
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Search starred problems…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-8"
          />
        </div>
        <select value={step} onChange={(e) => setStep(e.target.value)} className="input-base sm:w-48">
          <option value="all">All Steps</option>
          {(steps as any[]).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <div className="flex gap-1.5 flex-wrap">
          {(['All', 'Easy', 'Medium', 'Hard'] as ('All' | Difficulty)[]).map((d) => (
            <button key={d} onClick={() => setDiff(d)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                diff === d ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200')}>
              {d}
            </button>
          ))}
          <button
            onClick={() => setShowSolved(!showSolved)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              !showSolved ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200')}>
            Hide Solved
          </button>
        </div>
      </div>

      {starred.length === 0 ? (
        <div className="card p-12 text-center">
          <Star size={40} className="mx-auto text-dark-600 mb-3" />
          <h3 className="text-white font-semibold mb-1">No starred problems yet</h3>
          <p className="text-dark-400 text-sm mb-4">
            Star problems from the problem sheet or detail pages to track them here.
          </p>
          <Link to="/problems" className="btn-primary">Browse Problems</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="border-b border-dark-800 px-4 py-3">
            <span className="text-sm text-dark-400">{filtered.length} of {starred.length} starred</span>
          </div>
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-dark-500 text-sm">No problems match your filters</div>
          ) : (
            <div className="divide-y divide-dark-800/40">
              {filtered.map((p, i) => (
                <ProblemRow key={p.id} problem={p} index={i + 1} showStep />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
