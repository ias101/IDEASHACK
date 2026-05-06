export const ROLE_GRAD = {
  RESEARCHER: 'from-violet-500 to-purple-600',
  BUSINESS:   'from-blue-500 to-cyan-600',
  INVESTOR:   'from-amber-500 to-orange-600',
}
export const ROLE_TEXT = {
  RESEARCHER: 'text-violet-300 bg-violet-500/20',
  BUSINESS:   'text-blue-300 bg-blue-500/20',
  INVESTOR:   'text-amber-300 bg-amber-500/20',
}
export const STAGE_BADGE = {
  'Research-only':  'bg-gray-700 text-gray-300',
  'Validation':     'bg-blue-500/20 text-blue-300',
  'Communication':  'bg-cyan-500/20 text-cyan-300',
  'Prototype':      'bg-violet-500/20 text-violet-300',
  'Investor-ready': 'bg-emerald-500/20 text-emerald-300',
  'IP-sensitive':   'bg-amber-500/20 text-amber-300',
}
export const EVT_STYLE = {
  ROOM_CREATED:       'bg-indigo-500/10 text-indigo-400',
  MEMBER_JOIN:        'bg-blue-500/10 text-blue-400',
  STAGE_CHANGE:       'bg-emerald-500/10 text-emerald-400',
  MILESTONE_COMPLETE: 'bg-emerald-500/10 text-emerald-400',
  MILESTONE_ACTIVE:   'bg-indigo-500/10 text-indigo-400',
  AI_AUDIT:           'bg-violet-500/10 text-violet-400',
  IP_REGISTERED:      'bg-amber-500/10 text-amber-400',
  IP_UPDATED:         'bg-amber-500/10 text-amber-400',
}
export const EVT_LABEL = {
  ROOM_CREATED: 'Room Created', MEMBER_JOIN: 'Member Joined',
  STAGE_CHANGE: 'Stage Change', MILESTONE_COMPLETE: 'Milestone Done',
  MILESTONE_ACTIVE: 'Milestone Active', AI_AUDIT: 'AI Audit',
  IP_REGISTERED: 'IP Registered', IP_UPDATED: 'IP Updated',
}
export const RISK_STYLE = {
  HIGH:   { bg: 'bg-red-500/5 border-red-500/30',    badge: 'bg-red-500/20 text-red-300' },
  MEDIUM: { bg: 'bg-amber-500/5 border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300' },
  LOW:    { bg: 'bg-blue-500/5 border-blue-500/30',   badge: 'bg-blue-500/20 text-blue-300' },
}
export const VENTURE_STAGES = [
  'Research-only','Validation','Communication','Prototype','Investor-ready','IP-sensitive'
]

export function Chip({ children, cls = '' }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{children}</span>
}

export function Avatar({ initials = '??', grad = 'from-indigo-500 to-violet-500', size = 'w-8 h-8', text = 'text-xs' }) {
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold ${text} flex-shrink-0`}>
      {initials}
    </div>
  )
}

export function Card({ children, cls = '' }) {
  return <div className={`bg-gray-900 border border-gray-800 rounded-2xl ${cls}`}>{children}</div>
}

export function Spinner() {
  return (
    <svg className="spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
  )
}

export function ErrorBox({ msg }) {
  if (!msg) return null
  return (
    <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">
      {msg}
    </div>
  )
}

export function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false })
}
