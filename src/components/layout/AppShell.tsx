import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import RestTimerPopup from '../today/RestTimerPopup';

export default function AppShell() {
  return (
    <div className="min-h-screen pb-20"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f9ff 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Decorative gradient blobs */}
      <div className="fixed top-0 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="fixed top-1/2 right-0 w-64 h-64 bg-indigo-400/8 rounded-full blur-3xl translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-4">
          <Outlet />
        </main>
        <BottomNav />
        <RestTimerPopup />
      </div>
    </div>
  );
}
