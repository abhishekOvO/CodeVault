import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, ListChecks, Star, RefreshCw,
  Search, ListOrdered, Code2, BarChart2, Settings, AlertCircle,
  ChevronLeft, ChevronRight, Trophy, Vault,
} from 'lucide-react';
import { useStore, useStats } from '../store';
import { isSolved } from '../lib/utils';
import { cn } from '../lib/utils';
import { useMemo } from 'react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/roadmap', icon: Map, label: 'A2Z Roadmap' },
  { to: '/problems', icon: ListChecks, label: 'Problem Sheet' },
  { to: '/starred', icon: Star, label: 'Starred' },
  { to: '/revision', icon: RefreshCw, label: 'Revision Center' },
  { to: '/mistakes', icon: AlertCircle, label: 'My Mistakes' },
  { to: '/lists', icon: ListOrdered, label: 'Custom Lists' },
  { to: '/templates', icon: Code2, label: 'C++ Templates' },
  { to: '/search', icon: Search, label: 'Search / Dictionary' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

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

export default function Sidebar() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const steps = useStore((s) => s.steps);
  const problems = useStore((s) => s.problems);
  const streakDays = useStore((s) => s.settings.streakDays);
  const stats = useStats();

  const stepProgress = useMemo(() => {
    const result: Record<string, { solved: number; total: number }> = {};
    for (const step of steps as any[]) {
      let solved = 0;
      let total = 0;
      for (const p of Object.values(problems)) {
        if ((p as any).step === step.id) {
          total++;
          if (isSolved((p as any).status)) solved++;
        }
      }
      result[step.id] = { solved, total };
    }
    return result;
  }, [steps, problems]);

  const overallPct = stats.total ? Math.round((stats.solved / stats.total) * 100) : 0;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-full bg-dark-900 border-r border-dark-800 flex flex-col transition-all duration-300 overflow-hidden',
          sidebarOpen ? 'w-[280px]' : 'w-[60px]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-dark-800 min-h-[64px]">
          {sidebarOpen && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Vault size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-0.5">
                  Code<span className="text-brand-400">Vault</span>
                </div>
                <div className="text-[11px] font-medium text-dark-400">Striver A2Z DSA</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1.5 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Progress summary */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-dark-800">
            <div className="flex items-center justify-between text-xs text-dark-400 mb-1.5">
              <span>Overall Progress</span>
              <span className="text-brand-400 font-medium">
                {stats.solved}/{stats.total}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {/* Main nav items (first 4) */}
          {NAV_ITEMS.slice(0, 4).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn('sidebar-link', isActive && 'active', !sidebarOpen && 'justify-center px-0')
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}

          {/* Steps divider */}
          {sidebarOpen ? (
            <div className="pt-3 pb-1 px-2">
              <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                A2Z Steps
              </p>
            </div>
          ) : (
            <div className="border-t border-dark-800 my-2" />
          )}

          {/* Step links */}
          {(steps as any[]).map((step) => {
            const { solved, total } = stepProgress[step.id] ?? { solved: 0, total: 0 };
            const pct = total ? Math.round((solved / total) * 100) : 0;
            return (
              <NavLink
                key={step.id}
                to={`/roadmap/${step.id}`}
                className={({ isActive }) =>
                  cn('sidebar-link', isActive && 'active', !sidebarOpen && 'justify-center px-0')
                }
                title={!sidebarOpen ? step.name : undefined}
              >
                <span className="shrink-0 text-base leading-none">
                  {STEP_ICONS[step.id] ?? '📌'}
                </span>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate">{step.name}</span>
                      <span className="text-xs text-dark-500 ml-1 shrink-0">{pct}%</span>
                    </div>
                    <div className="progress-bar mt-0.5 h-0.5">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* Tools divider */}
          {sidebarOpen ? (
            <div className="pt-3 pb-1 px-2">
              <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Tools
              </p>
            </div>
          ) : (
            <div className="border-t border-dark-800 my-2" />
          )}

          {/* Remaining nav items */}
          {NAV_ITEMS.slice(4).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn('sidebar-link', isActive && 'active', !sidebarOpen && 'justify-center px-0')
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer streak */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-dark-800 text-xs text-dark-500">
            <div className="flex items-center gap-1.5">
              <Trophy size={12} className="text-amber-400" />
              <span>{streakDays} day streak</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
