import { NavLink } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { USER_COLORS } from '../../types';

const tabs = [
  { to: '/', label: 'Today', icon: '🏋️' },
  { to: '/schedule', label: 'Schedule', icon: '📋' },
  { to: '/history', label: 'History', icon: '📅' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/body', label: 'Body', icon: '⚖️' },
];

export default function BottomNav() {
  const { activeUser } = useUser();
  const activeColor = USER_COLORS[activeUser].primary;

  return (
    <nav className="fixed bottom-0 left-0 right-0 safe-area-bottom z-50"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.85))',
        borderTop: '1px solid rgba(255,255,255,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }: { isActive: boolean }) => `
              flex flex-col items-center justify-center px-3 py-1 rounded-lg min-w-0
              transition-all duration-200
              ${isActive ? 'scale-105' : 'opacity-60 hover:opacity-80'}
            `}
            style={({ isActive }: { isActive: boolean }) => ({
              color: isActive ? activeColor : '#6B7280',
            })}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap">
              {tab.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
