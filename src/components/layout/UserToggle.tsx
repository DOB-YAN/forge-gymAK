import { useUser } from '../../context/UserContext';
import type { UserId } from '../../types';
import { USER_COLORS } from '../../types';

const users: { id: UserId; label: string }[] = [
  { id: 'abel', label: 'Abel' },
  { id: 'keneni', label: 'Keneni' },
];

export default function UserToggle() {
  const { activeUser, setActiveUser } = useUser();

  return (
    <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
      {users.map((user) => {
        const isActive = activeUser === user.id;
        const colors = USER_COLORS[user.id];
        return (
          <button
            key={user.id}
            onClick={() => setActiveUser(user.id)}
            className={`
              flex-1 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${isActive ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
            style={{
              backgroundColor: isActive ? colors.primary : 'transparent',
            }}
          >
            {user.label}
          </button>
        );
      })}
    </div>
  );
}
