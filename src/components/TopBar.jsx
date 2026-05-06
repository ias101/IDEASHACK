import { useAuth } from '../contexts/AuthContext'
import { Avatar, ROLE_GRAD } from './ui'

export default function TopBar() {
  const { user } = useAuth()
  return (
    <header className="h-14 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        All actions audited · Trust Ledger active
      </div>
      {user && (
        <div className="flex items-center gap-2">
          <Avatar initials={user.avatar || '??'} grad={ROLE_GRAD[user.role] || 'from-indigo-500 to-violet-500'} size="w-7 h-7" />
          <div>
            <p className="text-xs font-medium text-white">{user.username}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-emerald-400">VERIFIED</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
