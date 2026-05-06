import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, Chip, ROLE_GRAD, ROLE_TEXT } from './ui'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',    icon: '⬛' },
  { to: '/ventures',  label: 'Venture Rooms', icon: '🌿' },
  { to: '/audit',     label: 'AI Audit',      icon: '✨' },
  { to: '/ledger',    label: 'Trust Ledger',  icon: '🔒' },
  { to: '/passport',  label: 'My Passport',   icon: '👤' },
  { to: '/settings',  label: 'Settings',      icon: '⚙️' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">@</div>
          <span className="font-bold text-white text-sm">platform</span>
          <span className="ml-auto text-xs text-gray-600 font-mono">Beta</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              isActive
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`
          }>
            <span>{icon}</span>{label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="px-3 pb-4 border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <Avatar initials={user.avatar || '??'} grad={ROLE_GRAD[user.role] || 'from-indigo-500 to-violet-500'} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.institution || 'No institution'}</p>
            </div>
          </div>
          <Chip cls={ROLE_TEXT[user.role] || 'text-gray-300 bg-gray-700'}>{user.role}</Chip>
          <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 mt-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </aside>
  )
}
