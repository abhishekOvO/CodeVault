import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, ExternalLink, Clock, CheckCircle,
  Copy, Eye, EyeOff, ChevronDown, ChevronUp, Edit3, Save, X,
  Plus, Trash2,
} from 'lucide-react';
import { useStore } from '../store';
import { useState, useEffect, useRef } from 'react';
import {
  difficultyBadgeClass, statusColor, statusLabel, isSolved, cn, formatDate, timeAgo,
} from '../lib/utils';
import type { ProblemStatus, SolutionApproach } from '../types';
import toast from 'react-hot-toast';
import CodeBlock from '../components/CodeBlock';

const STATUS_OPTIONS: { v: ProblemStatus; label: string }[] = [
  { v: 'not-started', label: 'Not Started' },
  { v: 'attempted', label: 'Attempted' },
  { v: 'solved-independent', label: '✓ Solved Independently' },
  { v: 'solved-hints', label: '✓ Solved with Hints' },
  { v: 'solved-after-solution', label: '✓ Solved after Solution' },
  { v: 'needs-revision', label: '⚠ Needs Revision' },
];

export default function ProblemDetail() {
  const { problemId } = useParams<{ problemId: string }>();
  const problems = useStore((s) => s.problems);
  const p = problemId ? problems[problemId] : null;

  const updateStatus = useStore((s) => s.updateStatus);
  const toggleStar = useStore((s) => s.toggleStar);
  const setPersonalNotes = useStore((s) => s.setPersonalNotes);
  const setNextReview = useStore((s) => s.setNextReview);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const markUnderstood = useStore((s) => s.markUnderstood);
  const updateProblemLink = useStore((s) => s.updateProblemLink);

  const [showSolution, setShowSolution] = useState(false);
  const [activeApproach, setActiveApproach] = useState(0);
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft, setNoteDraft] = useState(p?.personalNotes ?? '');
  const [addingLink, setAddingLink] = useState(false);
  const [newLinkPlatform, setNewLinkPlatform] = useState('leetcode');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    if (p) setNoteDraft(p.personalNotes);
  }, [p?.personalNotes]);

  if (!p) {
    return (
      <div className="text-center py-20 text-dark-400">
        <p>Problem not found.</p>
        <Link to="/problems" className="btn-primary mt-4 inline-flex">Back to Problems</Link>
      </div>
    );
  }

  const handleStatus = (status: ProblemStatus) => {
    updateStatus(p.id, status);
    if (['attempted', 'solved-independent', 'solved-hints', 'solved-after-solution'].includes(status)) {
      recordAttempt(p.id);
    }
    toast.success('Status updated');
  };

  const handleStar = () => {
    toggleStar(p.id);
    toast.success(p.starred ? 'Removed from starred' : '⭐ Added to starred');
  };

  const saveNotes = () => {
    setPersonalNotes(p.id, noteDraft);
    setEditingNotes(false);
    toast.success('Notes saved');
  };

  const handleAddLink = () => {
    if (newLinkUrl.trim()) {
      updateProblemLink(p.id, newLinkPlatform, newLinkUrl.trim());
      setNewLinkUrl('');
      setAddingLink(false);
      toast.success('Link added');
    }
  };

  // The primary code (either from approach or direct)
  const primaryCode = p.approaches.length > 0
    ? p.approaches[activeApproach]?.code ?? p.code
    : p.code;

  const primaryTime = p.approaches.length > 0
    ? p.approaches[activeApproach]?.timeComplexity ?? p.timeComplexity
    : p.timeComplexity;

  const primarySpace = p.approaches.length > 0
    ? p.approaches[activeApproach]?.spaceComplexity ?? p.spaceComplexity
    : p.spaceComplexity;

  return (
    <div className="max-w-5xl space-y-5">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link to={`/roadmap/${p.step}`} className="btn-ghost text-xs">
          <ArrowLeft size={13} /> {p.stepName}
        </Link>
        <span className="text-dark-600">/</span>
        <span className="text-sm text-dark-400 truncate">{p.title}</span>
      </div>

      {/* Header card */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs text-dark-500">#{p.num}</span>
              <span className={difficultyBadgeClass(p.difficulty)}>{p.difficulty}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-dark-800 text-dark-400 border border-dark-700">
                {p.stepName}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">{p.title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleStar}
              className={cn('btn-ghost', p.starred ? 'text-amber-400' : 'text-dark-400')}>
              <Star size={16} fill={p.starred ? 'currentColor' : 'none'} />
              {p.starred ? 'Starred' : 'Star'}
            </button>
          </div>
        </div>

        {/* Status & tracking */}
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-500">Status:</span>
            <select
              value={p.status}
              onChange={(e) => handleStatus(e.target.value as ProblemStatus)}
              className={cn('text-xs px-2.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 cursor-pointer outline-none focus:ring-1 focus:ring-brand-500', statusColor(p.status))}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.v} value={o.v} className="text-dark-200 bg-dark-900">{o.label}</option>
              ))}
            </select>
          </div>
          {p.attemptCount > 0 && (
            <span className="text-xs text-dark-500">
              {p.attemptCount} attempt{p.attemptCount > 1 ? 's' : ''} • Last: {timeAgo(p.lastAttempted)}
            </span>
          )}
          {p.nextReviewDate && (
            <span className="text-xs text-orange-400">
              Review: {formatDate(p.nextReviewDate)}
            </span>
          )}
          <label className="flex items-center gap-1.5 text-xs text-dark-400 cursor-pointer">
            <input type="checkbox" checked={p.understood}
              onChange={(e) => markUnderstood(p.id, e.target.checked)}
              className="rounded border-dark-600 bg-dark-800 text-brand-500 focus:ring-brand-500"
            />
            Understood
          </label>
        </div>

        {/* External links */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {p.links.map((l: any, i: number) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
              className="btn-secondary text-xs py-1.5">
              <ExternalLink size={12} />
              Open on {l.platform.charAt(0).toUpperCase() + l.platform.slice(1)}
            </a>
          ))}
          {!addingLink ? (
            <button onClick={() => setAddingLink(true)} className="btn-ghost text-xs">
              <Plus size={12} /> Add Link
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <select value={newLinkPlatform} onChange={(e) => setNewLinkPlatform(e.target.value)}
                className="input-base text-xs py-1.5 w-auto">
                <option value="leetcode">LeetCode</option>
                <option value="gfg">GFG</option>
                <option value="codestudio">CodeStudio</option>
                <option value="other">Other</option>
              </select>
              <input type="url" placeholder="https://..." value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="input-base text-xs py-1.5 w-48" />
              <button onClick={handleAddLink} className="btn-primary text-xs py-1.5">Save</button>
              <button onClick={() => setAddingLink(false)} className="btn-ghost text-xs py-1.5"><X size={12} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Problem description */}
          {p.description && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
                📋 Problem Description
              </h2>
              <div className="text-sm text-dark-300 leading-relaxed whitespace-pre-wrap">
                {p.description}
              </div>
            </div>
          )}

          {/* Algorithm */}
          {p.algorithm && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-dark-200 mb-3">🔢 Algorithm</h2>
              <div className="text-sm text-dark-300 leading-relaxed whitespace-pre-wrap">
                {p.algorithm}
              </div>
            </div>
          )}

          {/* Approaches tabs */}
          {p.approaches.length > 1 && (
            <div className="card overflow-hidden">
              <div className="flex border-b border-dark-800 overflow-x-auto">
                {p.approaches.map((a: SolutionApproach, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveApproach(i)}
                    className={cn(
                      'tab-trigger shrink-0',
                      activeApproach === i && 'text-brand-400 border-b-2 border-brand-500'
                    )}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
              {p.approaches[activeApproach] && (
                <div className="p-5">
                  <p className="text-sm text-dark-300 mb-3">
                    {p.approaches[activeApproach].explanation}
                  </p>
                  {p.approaches[activeApproach].algorithm && (
                    <div className="text-sm text-dark-400 mb-3 whitespace-pre-wrap">
                      {p.approaches[activeApproach].algorithm}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Solution code */}
          {primaryCode ? (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-dark-800">
                <h2 className="text-sm font-semibold text-dark-200">💻 C++ Solution</h2>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="btn-ghost text-xs"
                >
                  {showSolution ? (
                    <><EyeOff size={13} /> Hide Solution</>
                  ) : (
                    <><Eye size={13} /> Show Solution</>
                  )}
                </button>
              </div>
              {showSolution && (
                <div className="p-4">
                  <CodeBlock code={primaryCode} />
                  {/* Complexity */}
                  {(primaryTime || primarySpace) && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {primaryTime && (
                        <div className="bg-dark-800 rounded-lg p-3">
                          <div className="text-xs text-dark-500 mb-1">Time Complexity</div>
                          <div className="text-sm font-mono text-brand-300">{primaryTime}</div>
                        </div>
                      )}
                      {primarySpace && (
                        <div className="bg-dark-800 rounded-lg p-3">
                          <div className="text-xs text-dark-500 mb-1">Space Complexity</div>
                          <div className="text-sm font-mono text-purple-300">{primarySpace}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card p-5 text-center text-dark-500 text-sm">
              <p>No solution code extracted from PDF for this problem.</p>
              <p className="mt-1 text-xs">You can add a link to the problem to study it online.</p>
            </div>
          )}
        </div>

        {/* Sidebar panel */}
        <div className="space-y-4">
          {/* Complexity */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-dark-400 uppercase mb-3">Complexity</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-500">Time</span>
                <span className="text-xs font-mono text-brand-300">{p.timeComplexity ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-500">Space</span>
                <span className="text-xs font-mono text-purple-300">{p.spaceComplexity ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {p.tags && p.tags.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-dark-400 uppercase mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-dark-800 text-dark-400 rounded border border-dark-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Schedule review */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-dark-400 uppercase mb-3">Schedule Review</h3>
            <input
              type="date"
              value={p.nextReviewDate ?? ''}
              onChange={(e) => {
                setNextReview(p.id, e.target.value);
                toast.success('Review date set');
              }}
              className="input-base text-xs"
            />
            <div className="mt-2 flex gap-1.5 flex-wrap">
              {[1, 3, 7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + d);
                    setNextReview(p.id, date.toISOString().split('T')[0]);
                    toast.success(`Review in ${d} day${d > 1 ? 's' : ''}`);
                  }}
                  className="text-xs px-2 py-1 bg-dark-800 text-dark-400 rounded hover:text-dark-200 hover:bg-dark-700 transition-colors"
                >
                  +{d}d
                </button>
              ))}
            </div>
          </div>

          {/* Personal notes */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-dark-400 uppercase">My Notes</h3>
              {!editingNotes ? (
                <button onClick={() => setEditingNotes(true)} className="btn-ghost text-xs py-1">
                  <Edit3 size={11} /> Edit
                </button>
              ) : (
                <div className="flex gap-1">
                  <button onClick={saveNotes} className="btn-ghost text-xs py-1 text-emerald-400">
                    <Save size={11} /> Save
                  </button>
                  <button onClick={() => { setEditingNotes(false); setNoteDraft(p.personalNotes); }}
                    className="btn-ghost text-xs py-1">
                    <X size={11} />
                  </button>
                </div>
              )}
            </div>
            {editingNotes ? (
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Add your notes, observations, mistakes…"
                rows={6}
                className="input-base text-xs resize-none"
              />
            ) : (
              <div className="text-xs text-dark-400 leading-relaxed whitespace-pre-wrap min-h-[60px]">
                {p.personalNotes || <span className="text-dark-600 italic">No notes yet. Click Edit to add.</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
