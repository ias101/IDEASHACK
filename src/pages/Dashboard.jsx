import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ventures as venturesApi, ledger as ledgerApi } from '../api'
import { Card, Chip, Avatar, STAGE_BADGE, EVT_STYLE, fmtDate, Spinner } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [myVentures, setMyVentures] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([venturesApi.list(), ledgerApi.recent()]).then(([vRes, lRes]) => {
      setMyVentures(vRes.data)
      setRecentEvents(lRes.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-600"><Spinner /></div>

  const totalMilestones = myVentures.reduce((s, v) => s + (v.milestonesDone || 0), 0)

  const stats = [
    { label: 'My Ventures', value: myVentures.length, icon: '🌿' },
    { label: 'Trust Events', value: recentEvents.length, icon: '🔒' },
    { label: 'Members Across Ventures', value: myVentures.reduce((s, v) => s + (v.memberCount || 0), 0), icon: '👥' },
    { label: 'Milestones Completed', value: totalMilestones, icon: '✅' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, <span className="text-gray-300">{user?.username}</span></p>
      </div>

      {!user?.hasApiKey && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <span className="text-amber-400">⚠️</span>
          <p className="text-sm text-amber-300 flex-1">No OpenAI API key configured — AI Audit won't work yet.</p>
          <button onClick={() => navigate('/settings')} className="text-xs text-amber-400 hover:text-amber-300 font-medium">Add key →</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon }) => (
          <Card key={label} cls="p-5">
            <div className="text-2xl mb-3">{icon}</div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">My Venture Rooms</h2>
            <button onClick={() => navigate('/ventures')}
              className="text-xs text-indigo-400 hover:text-indigo-300">View all →</button>
          </div>

          {myVentures.length === 0 ? (
            <Card cls="p-8 text-center">
              <p className="text-gray-600 text-sm mb-4">No ventures yet.</p>
              <button onClick={() => navigate('/ventures')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors">
                Create your first venture →
              </button>
            </Card>
          ) : myVentures.map(v => (
            <div key={v.id} onClick={() => navigate(`/ventures/${v.id}`)}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 cursor-pointer hover:border-gray-700 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors truncate">{v.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{v.description}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 group-hover:text-indigo-400 transition-colors flex-shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <Chip cls={STAGE_BADGE[v.stage] || 'bg-gray-700 text-gray-300'}>{v.stage}</Chip>
                <span className="text-xs text-gray-600">{v.memberCount} members · {v.milestonesDone}/{v.milestonesTotal} milestones</span>
              </div>
              <div className="mt-3">
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${((v.stageIndex + 1) / 6) * 100}%`, background: 'linear-gradient(to right,#6366f1,#8b5cf6)' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Trust Events</h2>
            <button onClick={() => navigate('/ledger')} className="text-xs text-indigo-400 hover:text-indigo-300">Full ledger →</button>
          </div>
          <Card cls="p-4 space-y-3">
            {recentEvents.length === 0
              ? <p className="text-gray-600 text-sm text-center py-4">No events yet.</p>
              : recentEvents.slice(0, 8).map(e => (
                <div key={e.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg ${EVT_STYLE[e.type] || 'bg-gray-800 text-gray-500'} flex items-center justify-center flex-shrink-0 mt-0.5 text-xs`}>●</div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-200 leading-tight truncate">{e.detail}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">{e.actorName}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-600">{fmtDate(e.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </Card>
        </div>
      </div>
    </div>
  )
}
