import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Difficulty, ProblemStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function difficultyBadgeClass(d: Difficulty): string {
  switch (d) {
    case 'Easy': return 'badge-easy';
    case 'Medium': return 'badge-medium';
    case 'Hard': return 'badge-hard';
    default: return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-dark-700 text-dark-400 border border-dark-600';
  }
}

export function statusLabel(s: ProblemStatus): string {
  const map: Record<ProblemStatus, string> = {
    'not-started': 'Not Started',
    'attempted': 'Attempted',
    'solved-independent': 'Solved ✓',
    'solved-hints': 'Solved (hints)',
    'solved-after-solution': 'Solved (solution)',
    'needs-revision': 'Needs Revision',
  };
  return map[s] ?? s;
}

export function statusColor(s: ProblemStatus): string {
  const map: Record<ProblemStatus, string> = {
    'not-started': 'text-dark-500',
    'attempted': 'text-amber-400',
    'solved-independent': 'text-emerald-400',
    'solved-hints': 'text-teal-400',
    'solved-after-solution': 'text-blue-400',
    'needs-revision': 'text-orange-400',
  };
  return map[s] ?? 'text-dark-400';
}

export function isSolved(s: ProblemStatus): boolean {
  return ['solved-independent', 'solved-hints', 'solved-after-solution'].includes(s);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function getNextReviewDate(attemptCount: number, lastAttempted: string): string {
  // Simple SM-2-like intervals: 1, 3, 7, 14, 30 days
  const intervals = [1, 3, 7, 14, 30];
  const days = intervals[Math.min(attemptCount - 1, intervals.length - 1)] ?? 30;
  const next = new Date(lastAttempted);
  next.setDate(next.getDate() + days);
  return next.toISOString().split('T')[0];
}
