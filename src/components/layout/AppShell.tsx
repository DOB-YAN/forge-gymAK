import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import RestTimerPopup from '../today/RestTimerPopup';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-4">
        <Outlet />
      </main>
      <BottomNav />
      <RestTimerPopup />
    </div>
  );
}
