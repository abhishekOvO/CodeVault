import { Link } from 'react-router-dom';
import { Star, StarOff, CheckCircle, Circle, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import { difficultyBadgeClass, statusColor, statusLabel, isSolved, cn } from '../lib/utils';
import type { Problem } from '../types';
import toast from 'react-hot-toast';

interface Props {
  problem: Problem;
  index?: number;
  showStep?: boolean;
}

const STATUS_OPTIONS = [
  { v: 'not-started', label: 'Not Started' },
  { v: 'attempted', label: 'Attempted' },
  { v: 'solved-independent', label: 'Solved ✓' },
  { v: 'solved-hints', label: 'Solved (hints)' },
  { v: 'solved-after-solution', label: 'Solved (solution)' },
  { v: 'needs-revision', label: 'Needs Revision' },
] as const;

export default function ProblemRow({ problem: p, index, showStep = false }: Props) {
  const toggleStar = useStore((s) => s.toggleStar);
  const updateStatus = useStore((s) => s.updateStatus);
  const recordAttempt = useStore((s) => s.recordAttempt);

  const handleStar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStar(p.id);
    toast.success(p.starred ? 'Removed from starred' : 'Added to starred', { duration: 1500 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStatus = e.target.value as any;
    updateStatus(p.id, newStatus);
    if (['attempted', 'solved-independent', 'solved-hints', 'solved-after-solution'].includes(newStatus)) {
      recordAttempt(p.id);
    }
    toast.success('Status updated', { duration: 1200 });
  };

  const solved = isSolved(p.status);

  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-dark-800/40 transition-colors">
      {/* Index */}
      {index !== undefined && (
        <span className="text-xs text-dark-600 w-7 shrink-0 text-right">{index}</span>
      )}

      {/* Solved indicator */}
      <div className="shrink-0">
        {solved ? (
          <CheckCircle size={16} className="text-emerald-400" />
        ) : (
          <Circle size={16} className="text-dark-600" />
        )}
      </div>

      {/* Title */}
      <Link
        to={`/problems/${p.id}`}
        className={cn(
          'flex-1 min-w-0 text-sm font-medium truncate hover:text-brand-400 transition-colors',
          solved ? 'text-dark-400 line-through decoration-dark-600' : 'text-dark-200'
        )}
      >
        {p.title}
      </Link>

      {/* Step badge (if showing all problems) */}
      {showStep && (
        <span className="hidden lg:block text-xs text-dark-500 shrink-0 max-w-[120px] truncate">
          {p.stepName}
        </span>
      )}

      {/* Difficulty badge */}
      <span className={cn(difficultyBadgeClass(p.difficulty), 'shrink-0 hidden sm:inline-flex')}>
        {p.difficulty}
      </span>

      {/* Status dropdown */}
      <select
        value={p.status}
        onChange={handleStatusChange}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'hidden md:block text-xs px-2 py-1 rounded bg-dark-800 border border-dark-700 cursor-pointer outline-none focus:ring-1 focus:ring-brand-500 shrink-0',
          statusColor(p.status)
        )}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.v} value={o.v} className="text-dark-200 bg-dark-800">
            {o.label}
          </option>
        ))}
      </select>

      {/* External links */}
      {p.links && p.links.length > 0 && (
        <a
          href={p.links[0].url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="hidden sm:block p-1 rounded text-dark-500 hover:text-brand-400 transition-colors shrink-0"
          title={`Open on ${p.links[0].platform}`}
        >
          <ExternalLink size={13} />
        </a>
      )}

      {/* Star */}
      <button
        onClick={handleStar}
        className={cn(
          'p-1 rounded transition-colors shrink-0',
          p.starred
            ? 'text-amber-400 hover:text-amber-300'
            : 'text-dark-600 hover:text-amber-400 opacity-0 group-hover:opacity-100'
        )}
        title={p.starred ? 'Unstar' : 'Star'}
      >
        {p.starred ? <Star size={14} fill="currentColor" /> : <Star size={14} />}
      </button>
    </div>
  );
}
