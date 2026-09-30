import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import StepPage from './pages/StepPage';
import ProblemDetail from './pages/ProblemDetail';
import ProblemSheet from './pages/ProblemSheet';
import StarredPage from './pages/StarredPage';
import RevisionCenter from './pages/RevisionCenter';
import SearchPage from './pages/SearchPage';
import CustomListsPage from './pages/CustomListsPage';
import TemplatesPage from './pages/TemplatesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import MistakesPage from './pages/MistakesPage';
import { useStore } from './store';
import { useEffect } from 'react';

function App() {
  const theme = useStore((s) => s.settings.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/roadmap/:stepId" element={<StepPage />} />
        <Route path="/problems" element={<ProblemSheet />} />
        <Route path="/problems/:problemId" element={<ProblemDetail />} />
        <Route path="/starred" element={<StarredPage />} />
        <Route path="/revision" element={<RevisionCenter />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/lists" element={<CustomListsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/mistakes" element={<MistakesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
