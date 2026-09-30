// ============================================================
// Core Data Types for CodeVault
// ============================================================

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Unclassified';

export type ProblemStatus =
  | 'not-started'
  | 'attempted'
  | 'solved-independent'
  | 'solved-hints'
  | 'solved-after-solution'
  | 'needs-revision';

export interface SolutionApproach {
  id: string;
  name: string; // e.g., "Brute Force", "Better", "Optimal"
  explanation: string;
  algorithm: string;
  code: string | null;
  language: 'cpp' | 'python' | 'java';
  timeComplexity: string | null;
  spaceComplexity: string | null;
  notes?: string;
}

export interface ProblemLink {
  platform: 'leetcode' | 'gfg' | 'codestudio' | 'hackerrank' | 'other';
  url: string;
  label?: string;
}

export interface Problem {
  id: string;
  num: number;
  title: string;
  step: string;      // e.g., 'step-5'
  stepName: string;  // e.g., 'Arrays'
  subtopic?: string;
  difficulty: Difficulty;
  description: string;
  algorithm: string;
  code: string | null;  // primary approach code
  timeComplexity: string | null;
  spaceComplexity: string | null;
  tags: string[];
  approaches: SolutionApproach[];
  links: ProblemLink[];
  // user state (stored in localStorage via zustand)
  status: ProblemStatus;
  starred: boolean;
  attemptCount: number;
  lastAttempted: string | null;  // ISO date
  personalDifficulty: 1 | 2 | 3 | 4 | 5 | null;
  personalNotes: string;
  nextReviewDate: string | null;
  timeSpent: number; // minutes
  understood: boolean;
}

export interface Step {
  id: string;   // 'step-1', 'step-2', etc.
  name: string;
  description?: string;
  icon?: string;
  problems: string[]; // problem ids
  count: number;
}

export interface CustomList {
  id: string;
  name: string;
  description: string;
  color: string;
  problemIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  date: string;
  duration: number; // minutes
  problemsAttempted: string[];
  problemsSolved: string[];
  notes: string;
}

export interface DailyGoal {
  problemsTarget: number;
  revisionTarget: number;
  studyMinutes: number;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  codeLanguage: 'cpp' | 'python' | 'java';
  sidebarCollapsed: boolean;
  dailyGoal: DailyGoal;
  streakDays: number;
  lastStudyDate: string | null;
}

export type FilterStatus = 'all' | 'not-started' | 'attempted' | 'solved' | 'starred' | 'needs-revision';
export type SortBy = 'roadmap' | 'difficulty' | 'title' | 'status' | 'last-attempted';

export interface FilterState {
  difficulty: Difficulty | 'All';
  status: FilterStatus;
  step: string | 'all';
  search: string;
  sortBy: SortBy;
  starred: boolean;
}
