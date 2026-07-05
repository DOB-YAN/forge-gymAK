import { useState, useEffect } from 'react';
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import UserSelector, { getStoredUser, storeUser } from './components/UserSelector';
import { useUser } from './context/UserContext';
import type { UserId } from './types';

const TodayPage = lazy(() => import('./pages/TodayPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const BodyPage = lazy(() => import('./pages/BodyPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>Loading...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { setActiveUser } = useUser();
  const [showSelector, setShowSelector] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setActiveUser(stored);
      setShowSelector(false);
    }
    setInitialized(true);
  }, [setActiveUser]);

  const handleSelect = (user: UserId) => {
    storeUser(user);
    setActiveUser(user);
    setShowSelector(false);
  };

  if (!initialized || showSelector) {
    return <UserSelector onSelect={handleSelect} />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={
          <Suspense fallback={<PageLoader />}>
            <TodayPage />
          </Suspense>
        } />
        <Route path="schedule" element={
          <Suspense fallback={<PageLoader />}>
            <SchedulePage />
          </Suspense>
        } />
        <Route path="history" element={
          <Suspense fallback={<PageLoader />}>
            <HistoryPage />
          </Suspense>
        } />
        <Route path="progress" element={
          <Suspense fallback={<PageLoader />}>
            <ProgressPage />
          </Suspense>
        } />
        <Route path="body" element={
          <Suspense fallback={<PageLoader />}>
            <BodyPage />
          </Suspense>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return <AppContent />;
}
