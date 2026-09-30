# CodeVault — Striver A2Z DSA Platform

A complete, responsive personal DSA learning and revision platform built from the **Striver A2Z DSA PDF** (1,951 pages, 492 problems across 17 steps). This is your personal knowledge vault, roadmap tracker, C++ solution library, and spaced repetition revision system.

## 🚀 Quick Start

```bash
cd dsa-mastery
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🏗️ Architecture

```
src/
├── main.tsx          # Entry point (React + QueryClient + Router)
├── App.tsx           # Route definitions
├── index.css         # Global styles (Tailwind + custom components)
├── data/
│   └── courseData.json   # 1,763 problems extracted from PDF
├── store/
│   └── index.ts      # Zustand store (localStorage persistence)
├── types/
│   └── index.ts      # TypeScript types
├── lib/
│   └── utils.ts      # Utility functions (cn, difficulty badges, SM-2)
├── components/
│   ├── Layout.tsx    # Main layout wrapper
│   ├── Sidebar.tsx   # Collapsible sidebar with step progress
│   ├── Topbar.tsx    # Search bar, theme toggle, stats
│   └── ProblemRow.tsx # Reusable problem list row
└── pages/
    ├── Dashboard.tsx      # Home dashboard with charts & stats
    ├── Roadmap.tsx        # A2Z steps overview
    ├── StepPage.tsx       # Individual step with filtered problems
    ├── ProblemSheet.tsx   # Master problem list with all filters
    ├── ProblemDetail.tsx  # Full problem page (code, notes, links)
    ├── StarredPage.tsx    # Starred/favorited problems
    ├── RevisionCenter.tsx # Spaced-repetition revision system
    ├── SearchPage.tsx     # Fuzzy search (Fuse.js)
    ├── CustomListsPage.tsx # Custom revision collections
    ├── TemplatesPage.tsx  # C++ code templates & patterns
    ├── AnalyticsPage.tsx  # Progress charts (Recharts)
    ├── MistakesPage.tsx   # Struggling problems tracker
    └── SettingsPage.tsx   # Theme, goals, preferences
```

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v3 |
| State | Zustand + localStorage persistence |
| Routing | React Router v7 |
| Search | Fuse.js (fuzzy search) |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Icons | Lucide React |

## 📊 Data Model

### Problem (1,763 extracted from PDF)
```ts
{
  id, num, title, step, stepName, difficulty,
  description, algorithm, code,
  timeComplexity, spaceComplexity, tags,
  approaches: SolutionApproach[],
  links: ProblemLink[],
  // User state (persisted):
  status, starred, attemptCount, lastAttempted,
  personalDifficulty, personalNotes, nextReviewDate,
  timeSpent, understood
}
```

### Steps (extracted from PDF)
- step-1: Learn the Basics (66 problems)
- step-2: Recursion (127 problems)
- step-3: Hashing
- step-4: Sorting (38 problems)
- step-5: Arrays (183 problems)
- step-6: Binary Search (45 problems)
- step-7: Strings (221 problems)
- step-8–19: Greedy, Sliding Window, Linked List, Stack/Queue, Heap, Trees, BST, Backtracking, Graphs, DP, Tries, Bit Manipulation

## 💾 Persistence

All user progress is stored in **localStorage** under key `dsa-mastery-store`. This includes:
- Problem statuses and attempt counts
- Starred problems
- Personal notes and review dates
- Custom lists
- Study sessions and settings

The raw problem content (from PDF) stays in the bundled JSON and is merged with user state on every load. This means:
- ✅ Clearing localStorage only removes YOUR progress, not the course data
- ✅ Adding new problems to the JSON won't break existing user data

## 🔁 Revision System (SM-2 Inspired)

Review intervals: **1 → 3 → 7 → 14 → 30 days** based on attempt count.

Set review dates from any problem's detail page, or use the +1d, +3d, +7d quick buttons.

## 🔧 Customizing

### Adding Problem Links
Click "Add Link" on any problem detail page to add LeetCode/GFG/CodeStudio URLs.

### Re-running PDF Extraction
```bash
python parse_full.py
```
This regenerates `src/data/courseData.json` from the PDF. Manually added links will NOT be overwritten (they're stored in localStorage user state).

## 📦 Build for Production

```bash
npm run build
npm run preview
```

Output is in `dist/`. Deploy to any static host (Vercel, Netlify, GitHub Pages).

## 🎯 Features

- [x] **1,763 problems** from Striver A2Z PDF
- [x] **19 step roadmap** with progress tracking
- [x] **Filters**: difficulty, status, step, search
- [x] **Star/favorite** system with persistence
- [x] **Problem detail** with C++ code, notes, review scheduler
- [x] **Custom lists** (Interview Important, Weak Topics, etc.)
- [x] **Revision Center** with spaced-repetition scheduling
- [x] **Fuzzy search** across all 1,763 problems
- [x] **C++ Templates** library for all DSA patterns
- [x] **Analytics** with bar, pie, radar charts
- [x] **Mistakes tracker** (struggling problems)
- [x] **Dark/light theme**
- [x] **Responsive** (mobile + desktop)
- [x] **Collapsible sidebar** with per-step progress bars

## 📝 Content Notes

Problems are extracted from `A2Z Striver.pdf` prepared by Vinay Kajla. Difficulty labels are auto-classified and may need manual correction for edge cases. 

Any problem marked as `Unclassified` difficulty should be reviewed manually in the detail page.
