import { useState, useEffect } from 'react'
import { users as usersApi, ventures as venturesApi, ledger as ledgerApi } from '../api'
import { Card, Chip, Avatar, ROLE_GRAD, ROLE_TEXT, STAGE_BADGE, Spinner, fmtDate } from '../components/ui'

export default function Passport() {
  const [profile, setProfile] = useState(null)
  const [myVentures, setMyVentures] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([usersApi.passport(), venturesApi.list(), ledgerApi.all()]).then(([pRes, vRes, lRes]) => {
      setProfile(pRes.data)
      setMyVentures(vRes.data)
      const myId = pRes.data.id
      setRecentEvents(lRes.data.filter(e => e.actorId === myId).slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-600"><Spinner /></div>
  if (!profile) return null

  const grad = ROLE_GRAD[profile.role] || 'from-indigo-500 to-violet-500'
  const completedMilestones = myVentures.reduce((s, v) => s + (v.milestonesDone || 0), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <Card cls="overflow-hidden">
        <div className="h-24 opacity-30" style={{
          background: `linear-gradient(to right,${profile.role === 'RESEARCHER' ? '#8b5cf6,#7c3aed' : profile.role === 'BUSINESS' ? '#3b82f6,#0891b2' : '#f59e0b,#ea580c'})`
        }}></div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-5 -mt-10 mb-5">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-900 shadow-xl`}>
              {profile.avatar}
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-bold text-white">{profile.username}</h1>
              <p className="text-gray-400 text-sm">{profile.role}</p>
              {profile.institution && <p className="text-xs text-gray-500 mt-1">🏛 {profile.institution}{profile.department ? ` · ${profile.department}` : ''}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-xs text-emerald-300 font-medium">Verified · Platform</span>
            </div>
            <Chip cls={ROLE_TEXT[profile.role] || 'bg-gray-700 text-gray-300'}>{profile.role}</Chip>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { l: 'Active Ventures', v: myVentures.length, c: 'text-indigo-400' },
              { l: 'Milestones Done', v: completedMilestones, c: 'text-emerald-400' },
              { l: 'Trust Events', v: profile.metrics?.events || recentEvents.length, c: 'text-blue-400' },
              { l: 'API Key', v: profile.hasApiKey ? '✓' : '—', c: profile.hasApiKey ? 'text-emerald-400' : 'text-gray-600' },
            ].map(({ l, v, c }) => (
              <div key={l} className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-3 text-center">
                <div className={`text-lg font-bold ${c}`}>{v}</div>
                <div className="text-xs text-gray-600 leading-tight mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 space-y-5">
          {/* Active Ventures */}
          <Card cls="p-5">
            <p className="text-sm font-semibold text-white mb-4">🌿 Active Ventures</p>
            {myVentures.length === 0
              ? <p className="text-gray-600 text-sm">No ventures yet.</p>
              : myVentures.map(v => (
                <div key={v.id} className="border border-gray-800 rounded-xl p-4 mb-2 last:mb-0">
                  <p className="text-sm font-medium text-white mb-1">{v.title}</p>
                  <p className="text-xs text-gray-500 mb-2">Updated {fmtDate(v.updatedAt)}</p>
                  <div className="flex items-center gap-2">
                    <Chip cls={STAGE_BADGE[v.stage] || 'bg-gray-700 text-gray-300'}>{v.stage}</Chip>
                    <span className="text-xs text-gray-600">{v.milestonesDone}/{v.milestonesTotal} milestones</span>
                  </div>
                </div>
              ))}
          </Card>

          {/* Recent Ledger Activity */}
          <Card cls="p-5">
            <p className="text-sm font-semibold text-white mb-4">🔒 My Trust Events</p>
            {recentEvents.length === 0
              ? <p className="text-gray-600 text-sm">No events yet.</p>
              : recentEvents.map(e => (
                <div key={e.id} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-xs text-gray-300 leading-snug">{e.detail}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{fmtDate(e.timestamp)}</p>
                  </div>
                </div>
              ))}
          </Card>
        </div>

        <div className="col-span-2 space-y-5">
          <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5">
            <p className="text-sm font-semibold text-indigo-300 mb-3">🏆 Trust Summary</p>
            {[
              { l: 'Identity', s: 'Verified', c: 'text-emerald-400' },
              { l: 'Collaboration record', s: 'On-chain', c: 'text-emerald-400' },
              { l: 'API Key configured', s: profile.hasApiKey ? 'Yes' : 'No', c: profile.hasApiKey ? 'text-emerald-400' : 'text-gray-600' },
              { l: 'Role', s: profile.role, c: 'text-gray-300' },
            ].map(({ l, s, c }) => (
              <div key={l} className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{l}</span>
                <span className={`text-xs font-medium ${c}`}>{s}</span>
              </div>
            ))}
          </div>

          <Card cls="px-4 py-4">
            <p className="text-xs text-gray-600 mb-1">Account info</p>
            <p className="text-sm font-semibold text-gray-200">{profile.username}</p>
            <p className="text-xs text-gray-500">{profile.email}</p>
            {profile.institution && <p className="text-xs text-gray-600 mt-1">{profile.institution}</p>}
          </Card>

          <div className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-5">
            <p className="text-xs font-semibold text-violet-300 mb-2">✨ About Your Role</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              {profile.role === 'RESEARCHER' && 'You create and lead Venture Rooms. Your research output drives the commercialization pipeline. Protect your IP at every stage.'}
              {profile.role === 'BUSINESS' && 'You source and validate deep-tech opportunities. Your business development expertise bridges research and market.'}
              {profile.role === 'INVESTOR' && 'You access due-diligence-ready ventures. Every action in the Trust Ledger provides full audit transparency.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
