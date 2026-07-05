import UserToggle from './UserToggle';
import { useUser } from '../../context/UserContext';
import { USER_COLORS } from '../../types';

export default function Header() {
  const { activeUser } = useUser();
  const colors = USER_COLORS[activeUser];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: colors.primary }}>
              FORGE
            </h1>
            <p className="text-xs text-gray-400">Track your gains</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: colors.primary }}
            />
            <span className="text-sm font-medium capitalize" style={{ color: colors.primary }}>
              {activeUser}
            </span>
          </div>
        </div>
        <UserToggle />
      </div>
    </header>
  );
}
