import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';

const TodayPage = lazy(() => import('./pages/TodayPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const BodyPage = lazy(() => import('./pages/BodyPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={
          <Suspense fallback={<PageLoader />}>
            <TodayPage />
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
        <Route path="history" element={
          <Suspense fallback={<PageLoader />}>
            <HistoryPage />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        } />
      </Route>
    </Routes>
  );
}
