import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { isSolved } from '../lib/utils';
import ProblemRow from '../components/ProblemRow';

export default function MistakesPage() {
  const allProblems = useStore((s) => s.problems); // stable object ref

  const struggling = useMemo(
    () =>
      Object.values(allProblems)
        .filter((p) => p.attemptCount >= 2 && !isSolved(p.status))
        .sort((a, b) => b.attemptCount - a.attemptCount),
    [allProblems]
  );

  const needsRevision = useMemo(
    () => Object.values(allProblems).filter((p) => p.status === 'needs-revision'),
    [allProblems]
  );

  const noted = useMemo(
    () =>
      Object.values(allProblems).filter(
        (p) =>
          p.personalNotes &&
          (p.personalNotes.toLowerCase().includes('mistake') ||
            p.personalNotes.toLowerCase().includes('wrong') ||
            p.personalNotes.toLowerCase().includes('error') ||
            p.personalNotes.toLowerCase().includes('forgot'))
      ),
    [allProblems]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertCircle size={22} className="text-red-400" /> My Mistakes
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          Track weak areas and repeated mistakes to improve
        </p>
      </div>

      {/* Struggling */}
      <section>
        <h2 className="text-base font-semibold text-white mb-3">
          Struggling With ({struggling.length})
          <span className="text-xs font-normal text-dark-400 ml-2">2+ attempts, not solved</span>
        </h2>
        {struggling.length === 0 ? (
          <div className="card p-6 text-center text-dark-500 text-sm">No struggling problems 🎉</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="divide-y divide-dark-800/40">
              {struggling.map((p, i) => (
                <div key={p.id} className="flex items-center">
                  <div className="flex-1">
                    <ProblemRow problem={p} index={i + 1} showStep />
                  </div>
                  <span className="pr-4 text-xs text-red-400 shrink-0">
                    {p.attemptCount}x tried
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Needs revision */}
      <section>
        <h2 className="text-base font-semibold text-white mb-3">
          Marked for Revision ({needsRevision.length})
        </h2>
        {needsRevision.length === 0 ? (
          <div className="card p-6 text-center text-dark-500 text-sm">None marked for revision</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="divide-y divide-dark-800/40">
              {needsRevision.map((p, i) => (
                <ProblemRow key={p.id} problem={p} index={i + 1} showStep />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Problems with mistake notes */}
      {noted.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-white mb-3">
            Problems with Mistake Notes ({noted.length})
          </h2>
          <div className="space-y-3">
            {noted.map((p) => (
              <div key={p.id} className="card p-4">
                <Link
                  to={`/problems/${p.id}`}
                  className="text-sm font-medium text-white hover:text-brand-400 transition-colors"
                >
                  {p.title}
                </Link>
                <p className="text-xs text-dark-400 mt-1.5 line-clamp-2">{p.personalNotes}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
