import { Link } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight, Lock } from 'lucide-react';
import { useStore } from '../store';
import { isSolved } from '../lib/utils';
import { useMemo } from 'react';

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

const STEP_COLORS: Record<string, string> = {
  'step-1': 'from-blue-600 to-blue-800',
  'step-2': 'from-indigo-600 to-indigo-800',
  'step-3': 'from-cyan-600 to-cyan-800',
  'step-4': 'from-teal-600 to-teal-800',
  'step-5': 'from-emerald-600 to-emerald-800',
  'step-6': 'from-orange-600 to-orange-800',
  'step-7': 'from-purple-600 to-purple-800',
  'step-8': 'from-zinc-600 to-zinc-800',
  'step-9': 'from-red-600 to-red-800',
  'step-10': 'from-yellow-600 to-yellow-800',
  'step-11': 'from-rose-600 to-rose-800',
  'step-12': 'from-lime-600 to-lime-800',
  'step-13': 'from-emerald-600 to-emerald-800',
  'step-14': 'from-green-600 to-green-800',
  'step-15': 'from-fuchsia-600 to-fuchsia-800',
  'step-16': 'from-amber-600 to-amber-800',
  'step-17': 'from-sky-600 to-sky-800',
};

export default function Roadmap() {
  const steps = useStore((s) => s.steps);
  const problems = useStore((s) => s.problems);

  const stepStats = useMemo(
    () =>
      steps.map((step: any) => {
        const stepProbs = Object.values(problems).filter((p) => p.step === step.id);
        const solved = stepProbs.filter((p) => isSolved(p.status)).length;
        const attempted = stepProbs.filter((p) => p.status === 'attempted').length;
        const easy = stepProbs.filter((p) => p.difficulty === 'Easy').length;
        const medium = stepProbs.filter((p) => p.difficulty === 'Medium').length;
        const hard = stepProbs.filter((p) => p.difficulty === 'Hard').length;
        return {
          ...step,
          solved,
          attempted,
          total: stepProbs.length,
          easy,
          medium,
          hard,
          pct: stepProbs.length ? Math.round((solved / stepProbs.length) * 100) : 0,
        };
      }),
    [steps, problems]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">A2Z DSA Roadmap</h1>
        <p className="text-dark-400 text-sm mt-1">
          Complete learning path — {steps.length} steps, {Object.keys(problems).length} problems from Striver A2Z PDF
        </p>
      </div>

      {/* Summary bar */}
      <div className="card p-4 flex flex-wrap gap-6">
        {(() => {
          const total = Object.keys(problems).length;
          const solved = Object.values(problems).filter((p) => isSolved(p.status)).length;
          const pct = total ? Math.round((solved / total) * 100) : 0;
          return (
            <>
              <div>
                <div className="text-xl font-bold text-emerald-400">{solved}</div>
                <div className="text-xs text-dark-400">Solved</div>
              </div>
              <div>
                <div className="text-xl font-bold text-dark-200">{total}</div>
                <div className="text-xs text-dark-400">Total Problems</div>
              </div>
              <div>
                <div className="text-xl font-bold text-brand-400">{pct}%</div>
                <div className="text-xs text-dark-400">Complete</div>
              </div>
              <div className="flex-1 flex items-center">
                <div className="progress-bar h-2 flex-1">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stepStats.map((step: any, idx: number) => (
          <Link
            key={step.id}
            to={`/roadmap/${step.id}`}
            className="card-hover p-5 flex flex-col gap-4 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${STEP_COLORS[step.id] ?? 'from-gray-600 to-gray-800'} flex items-center justify-center text-2xl shrink-0`}>
                  {STEP_ICONS[step.id] ?? '📌'}
                </div>
                <div>
                  <div className="text-xs text-dark-500 font-medium">Step {idx + 1}</div>
                  <div className="text-sm font-semibold text-white leading-tight">{step.name}</div>
                </div>
              </div>
              {step.pct === 100 ? (
                <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-1" />
              ) : (
                <ArrowRight size={16} className="text-dark-600 group-hover:text-dark-400 transition-colors shrink-0 mt-1" />
              )}
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-dark-400">{step.solved} / {step.total} solved</span>
                <span className="text-brand-400 font-medium">{step.pct}%</span>
              </div>
              <div className="progress-bar h-1.5">
                <div className="progress-fill" style={{ width: `${step.pct}%` }} />
              </div>
            </div>

            {/* Difficulty split */}
            <div className="flex gap-2 flex-wrap">
              {step.easy > 0 && <span className="badge-easy">{step.easy} Easy</span>}
              {step.medium > 0 && <span className="badge-medium">{step.medium} Med</span>}
              {step.hard > 0 && <span className="badge-hard">{step.hard} Hard</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
