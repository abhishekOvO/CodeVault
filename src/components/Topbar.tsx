import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Moon, Sun, Menu, Bell } from 'lucide-react';
import { useStore, useStats } from '../store';
import { useState } from 'react';

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const toggleTheme = useStore((s) => s.toggleTheme);
  const theme = useStore((s) => s.settings.theme);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const stats = useStats();
  const [q, setQ] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setQ('');
    }
  };

  // Build breadcrumb from path
  const parts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = parts.map((p) =>
    p.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );

  return (
    <header className="sticky top-0 z-20 h-16 bg-dark-900/80 backdrop-blur border-b border-dark-800 flex items-center gap-4 px-4">
      {/* Menu toggle for mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm text-dark-400 flex-1">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-dark-600">/</span>}
            <span className={i === breadcrumb.length - 1 ? 'text-dark-200 font-medium' : ''}>
              {b}
            </span>
          </span>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm ml-auto">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search problems…"
            className="w-full pl-8 pr-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
          />
        </div>
      </form>

      {/* Stats pill */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-lg border border-dark-700 text-xs">
        <span className="text-emerald-400 font-semibold">{stats.solved}</span>
        <span className="text-dark-500">solved</span>
        <span className="text-dark-600">/</span>
        <span className="text-dark-400">{stats.total}</span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors"
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
