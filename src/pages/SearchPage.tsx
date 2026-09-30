import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Search as SearchIcon } from 'lucide-react';
import { useStore } from '../store';
import { difficultyBadgeClass, isSolved, cn } from '../lib/utils';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const problems = useStore((s) => s.problems);

  useEffect(() => {
    const qParam = params.get('q');
    if (qParam) setQ(qParam);
  }, [params]);

  const fuse = useMemo(
    () =>
      new Fuse(Object.values(problems), {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'stepName', weight: 1 },
          { name: 'description', weight: 0.5 },
          { name: 'tags', weight: 1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [problems]
  );

  const results = useMemo(() => {
    if (!q.trim()) return [];
    return fuse.search(q.trim()).slice(0, 40);
  }, [q, fuse]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SearchIcon size={22} /> Search & DSA Dictionary
        </h1>
        <p className="text-dark-400 text-sm mt-1">Search across all problems, topics, and tags</p>
      </div>

      <div className="relative">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search problems by title, topic, algorithm…"
          className="input-base pl-11 py-3 text-base"
          autoFocus
        />
      </div>

      {q.trim() === '' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {['Arrays', 'Binary Search', 'DP', 'Graphs', 'Trees', 'Sorting', 'Greedy', 'Backtracking'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQ(tag)}
              className="card-hover p-4 text-left group"
            >
              <span className="text-sm font-medium text-dark-200 group-hover:text-white">{tag}</span>
            </button>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="card p-12 text-center">
          <SearchIcon size={40} className="mx-auto text-dark-600 mb-3" />
          <p className="text-dark-400">No results for "{q}"</p>
          <p className="text-xs text-dark-500 mt-1">Try different keywords or topic names</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-dark-500">{results.length} results for "{q}"</p>
          <div className="card overflow-hidden">
            <div className="divide-y divide-dark-800/40">
              {results.map(({ item: p, score }) => (
                <Link
                  key={p.id}
                  to={`/problems/${p.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-dark-800/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-dark-200 truncate">{p.title}</div>
                    <div className="text-xs text-dark-500 mt-0.5 truncate">{p.stepName}</div>
                  </div>
                  <span className={cn(difficultyBadgeClass(p.difficulty), 'shrink-0')}>
                    {p.difficulty}
                  </span>
                  {isSolved(p.status) && (
                    <span className="text-xs text-emerald-400 shrink-0">✓ Solved</span>
                  )}
                  {score !== undefined && (
                    <span className="text-xs text-dark-600 shrink-0">
                      {Math.round((1 - score) * 100)}% match
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
