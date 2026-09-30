import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Calendar, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { isSolved, cn } from '../lib/utils';
import ProblemRow from '../components/ProblemRow';

type Tab = 'due' | 'all-starred' | 'needs-revision' | 'weak';

export default function RevisionCenter() {
  const allProblems = useStore((s) => s.problems); // stable object ref
  const [tab, setTab] = useState<Tab>('due');

  // All derived lists via useMemo to avoid new references on every render
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
  const needsRevision = useMemo(
    () => Object.values(allProblems).filter((p) => p.status === 'needs-revision'),
    [allProblems]
  );
  const weak = useMemo(
    () =>
      Object.values(allProblems)
        .filter((p) => p.attemptCount >= 2 && !isSolved(p.status))
        .sort((a, b) => b.attemptCount - a.attemptCount),
    [allProblems]
  );

  const tabs: { v: Tab; label: string; count: number; color: string }[] = [
    { v: 'due', label: 'Due Today', count: revisionDue.length, color: 'text-orange-400' },
    { v: 'all-starred', label: 'All Starred', count: starred.length, color: 'text-amber-400' },
    { v: 'needs-revision', label: 'Needs Revision', count: needsRevision.length, color: 'text-red-400' },
    { v: 'weak', label: 'Struggling With', count: weak.length, color: 'text-purple-400' },
  ];

  const list =
    tab === 'due' ? revisionDue :
    tab === 'all-starred' ? starred :
    tab === 'needs-revision' ? needsRevision :
    weak;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <RefreshCw size={22} className="text-orange-400" /> Revision Center
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          Spaced repetition — review problems at the right time for maximum retention
        </p>
      </div>

      {/* SM-2 explainer */}
      <div className="card p-4 border-l-4 border-brand-500 flex items-start gap-3">
        <Calendar size={18} className="text-brand-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-dark-200">Spaced Repetition Schedule</p>
          <p className="text-xs text-dark-400 mt-0.5">
            Review intervals: 1 → 3 → 7 → 14 → 30 days based on attempt count.
            Set a review date from any problem's detail page.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-800 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all',
              tab === t.v
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-dark-400 hover:text-dark-200'
            )}
          >
            {t.label}
            <span className={cn('ml-2 text-xs font-semibold', t.color)}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Problem list */}
      {list.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3 opacity-60" />
          <h3 className="text-white font-semibold mb-1">All clear!</h3>
          <p className="text-dark-400 text-sm">
            {tab === 'due' ? 'No problems due for review today.' :
             tab === 'all-starred' ? 'No starred problems yet.' :
             tab === 'needs-revision' ? 'No problems marked for revision.' :
             'No struggling problems detected.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="border-b border-dark-800 px-4 py-3">
            <span className="text-sm text-dark-400">{list.length} problems</span>
          </div>
          <div className="divide-y divide-dark-800/40">
            {list.map((p, i) => (
              <ProblemRow key={p.id} problem={p} index={i + 1} showStep />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
