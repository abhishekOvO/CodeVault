import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useMemo } from 'react';
import type {
  Problem,
  ProblemStatus,
  CustomList,
  StudySession,
  UserSettings,
  FilterState,
} from '../types';
import rawData from '../data/courseData.json';

// ── Enrich raw problems with user-state defaults ──────────────────────────────
function buildProblems(): Record<string, Problem> {
  const map: Record<string, Problem> = {};
  for (const p of (rawData as any).problems) {
    map[p.id] = {
      ...p,
      links: p.links ?? [],
      approaches: p.approaches ?? [],
      status: 'not-started' as ProblemStatus,
      starred: false,
      attemptCount: 0,
      lastAttempted: null,
      personalDifficulty: null,
      personalNotes: '',
      nextReviewDate: null,
      timeSpent: 0,
      understood: false,
    };
  }
  return map;
}

const DEFAULT_PROBLEMS = buildProblems();

// ── Store shape ───────────────────────────────────────────────────────────────
interface DSAStore {
  // ── Data ─────────────────────────────────────
  problems: Record<string, Problem>;
  steps: typeof rawData.steps;
  customLists: CustomList[];
  sessions: StudySession[];
  settings: UserSettings;
  filters: FilterState;
  sidebarOpen: boolean;
  currentStep: string | null;

  // ── Problem actions ───────────────────────────
  updateStatus: (id: string, status: ProblemStatus) => void;
  toggleStar: (id: string) => void;
  setPersonalNotes: (id: string, notes: string) => void;
  setPersonalDifficulty: (id: string, d: 1 | 2 | 3 | 4 | 5) => void;
  setNextReview: (id: string, date: string) => void;
  recordAttempt: (id: string, timeSpent?: number) => void;
  markUnderstood: (id: string, val: boolean) => void;
  updateProblemLink: (id: string, platform: string, url: string) => void;

  // ── Lists ─────────────────────────────────────
  createList: (name: string, description: string, color: string) => void;
  deleteList: (id: string) => void;
  addToList: (listId: string, problemId: string) => void;
  removeFromList: (listId: string, problemId: string) => void;
  renameList: (listId: string, name: string) => void;

  // ── Sessions ──────────────────────────────────
  addSession: (session: Omit<StudySession, 'id'>) => void;

  // ── Filters ───────────────────────────────────
  setFilter: (f: Partial<FilterState>) => void;
  resetFilters: () => void;

  // ── Settings ──────────────────────────────────
  setSettings: (s: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentStep: (step: string | null) => void;
}

const DEFAULT_FILTERS: FilterState = {
  difficulty: 'All',
  status: 'all',
  step: 'all',
  search: '',
  sortBy: 'roadmap',
  starred: false,
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  codeLanguage: 'cpp',
  sidebarCollapsed: false,
  dailyGoal: { problemsTarget: 5, revisionTarget: 3, studyMinutes: 60 },
  streakDays: 0,
  lastStudyDate: null,
};

// ── Zustand store with localStorage persistence ───────────────────────────────
export const useStore = create<DSAStore>()(
  persist(
    (set, get) => ({
      problems: DEFAULT_PROBLEMS,
      steps: rawData.steps,
      customLists: [],
      sessions: [],
      settings: DEFAULT_SETTINGS,
      filters: DEFAULT_FILTERS,
      sidebarOpen: true,
      currentStep: null,

      // Problem actions
      updateStatus: (id, status) =>
        set((s) => ({
          problems: {
            ...s.problems,
            [id]: { ...s.problems[id], status },
          },
        })),

      toggleStar: (id) =>
        set((s) => ({
          problems: {
            ...s.problems,
            [id]: { ...s.problems[id], starred: !s.problems[id].starred },
          },
        })),

      setPersonalNotes: (id, notes) =>
        set((s) => ({
          problems: { ...s.problems, [id]: { ...s.problems[id], personalNotes: notes } },
        })),

      setPersonalDifficulty: (id, d) =>
        set((s) => ({
          problems: { ...s.problems, [id]: { ...s.problems[id], personalDifficulty: d } },
        })),

      setNextReview: (id, date) =>
        set((s) => ({
          problems: { ...s.problems, [id]: { ...s.problems[id], nextReviewDate: date } },
        })),

      recordAttempt: (id, timeSpent = 0) =>
        set((s) => {
          const p = s.problems[id];
          // Update streak
          const today = new Date().toISOString().split('T')[0];
          const last = s.settings.lastStudyDate;
          const streak =
            last === today
              ? s.settings.streakDays
              : last === new Date(Date.now() - 86400000).toISOString().split('T')[0]
              ? s.settings.streakDays + 1
              : 1;
          return {
            problems: {
              ...s.problems,
              [id]: {
                ...p,
                attemptCount: p.attemptCount + 1,
                lastAttempted: new Date().toISOString(),
                timeSpent: p.timeSpent + timeSpent,
              },
            },
            settings: { ...s.settings, streakDays: streak, lastStudyDate: today },
          };
        }),

      markUnderstood: (id, val) =>
        set((s) => ({
          problems: { ...s.problems, [id]: { ...s.problems[id], understood: val } },
        })),

      updateProblemLink: (id, platform, url) =>
        set((s) => {
          const p = s.problems[id];
          const links = p.links.filter((l: any) => l.platform !== platform);
          if (url) links.push({ platform, url } as any);
          return { problems: { ...s.problems, [id]: { ...p, links } } };
        }),

      // Lists
      createList: (name, description, color) =>
        set((s) => ({
          customLists: [
            ...s.customLists,
            {
              id: `list-${Date.now()}`,
              name,
              description,
              color,
              problemIds: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      deleteList: (id) =>
        set((s) => ({ customLists: s.customLists.filter((l) => l.id !== id) })),

      addToList: (listId, problemId) =>
        set((s) => ({
          customLists: s.customLists.map((l) =>
            l.id === listId && !l.problemIds.includes(problemId)
              ? { ...l, problemIds: [...l.problemIds, problemId], updatedAt: new Date().toISOString() }
              : l
          ),
        })),

      removeFromList: (listId, problemId) =>
        set((s) => ({
          customLists: s.customLists.map((l) =>
            l.id === listId
              ? { ...l, problemIds: l.problemIds.filter((id) => id !== problemId), updatedAt: new Date().toISOString() }
              : l
          ),
        })),

      renameList: (listId, name) =>
        set((s) => ({
          customLists: s.customLists.map((l) =>
            l.id === listId ? { ...l, name, updatedAt: new Date().toISOString() } : l
          ),
        })),

      // Sessions
      addSession: (session) =>
        set((s) => ({
          sessions: [{ ...session, id: `sess-${Date.now()}` }, ...s.sessions].slice(0, 200),
        })),

      // Filters
      setFilter: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      // Settings
      setSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      toggleTheme: () =>
        set((s) => {
          const theme = s.settings.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.classList.toggle('dark', theme === 'dark');
          return { settings: { ...s.settings, theme } };
        }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentStep: (step) => set({ currentStep: step }),
    }),
    {
      name: 'dsa-mastery-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist user-state, not the raw problem content (it's in JSON import)
      partialize: (s) => ({
        problems: Object.fromEntries(
          Object.entries(s.problems).map(([id, p]) => [
            id,
            {
              status: p.status,
              starred: p.starred,
              attemptCount: p.attemptCount,
              lastAttempted: p.lastAttempted,
              personalDifficulty: p.personalDifficulty,
              personalNotes: p.personalNotes,
              nextReviewDate: p.nextReviewDate,
              timeSpent: p.timeSpent,
              understood: p.understood,
              links: p.links,
            },
          ])
        ),
        customLists: s.customLists,
        sessions: s.sessions,
        settings: s.settings,
      }),
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          return {
            ...persistedState,
            problems: {},
          };
        }
        return persistedState;
      },
      // On rehydrate, merge persisted user state into fresh problem data
      merge: (persisted: any, current) => {
        const fresh = buildProblems();
        if (persisted?.problems) {
          for (const [id, userState] of Object.entries(persisted.problems as Record<string, any>)) {
            if (fresh[id]) {
              fresh[id] = { ...fresh[id], ...userState };
            }
          }
        }
        return {
          ...current,
          problems: fresh,
          customLists: persisted?.customLists ?? [],
          sessions: persisted?.sessions ?? [],
          settings: { ...DEFAULT_SETTINGS, ...(persisted?.settings ?? {}) },
        };
      },
    }
  )
);

// ── Derived selectors and hooks ─────────────────────────────────────────────
export const selectStats = (state: DSAStore) => {
  const all = Object.values(state.problems);
  const total = all.length;
  let solved = 0;
  let attempted = 0;
  let starred = 0;
  let needsRevision = 0;
  for (const p of all) {
    if (['solved-independent', 'solved-hints', 'solved-after-solution'].includes(p.status)) {
      solved++;
    } else if (p.status === 'attempted') {
      attempted++;
    } else if (p.status === 'needs-revision') {
      needsRevision++;
    }
    if (p.starred) starred++;
  }
  return { total, solved, attempted, starred, needsRevision, notStarted: total - solved - attempted };
};

// Safe hook for components to read stats with memoization against problems reference
export function useStats() {
  const problems = useStore((s) => s.problems);
  return useMemo(() => {
    return selectStats({ problems } as any);
  }, [problems]);
}

// Array selectors: use inside useMemo() in components to avoid infinite loops.
export const selectStarredProblems = (state: DSAStore) =>
  Object.values(state.problems).filter((p) => p.starred);

export const selectRevisionDue = (state: DSAStore) => {
  const today = new Date().toISOString().split('T')[0];
  return Object.values(state.problems).filter(
    (p) => p.nextReviewDate && p.nextReviewDate <= today
  );
};
