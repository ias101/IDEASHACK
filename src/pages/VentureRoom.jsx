import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ventures as venturesApi, ledger as ledgerApi } from '../api'
import { Card, Chip, Avatar, STAGE_BADGE, ROLE_TEXT, EVT_STYLE, VENTURE_STAGES, Spinner, ErrorBox, fmtDate } from '../components/ui'

export default function VentureRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [v, setV] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [memberUsername, setMemberUsername] = useState('')
  const [addingMilestone, setAddingMilestone] = useState(false)
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [ipInput, setIpInput] = useState('')
  const [editingIp, setEditingIp] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [actionError, setActionError] = useState('')

  const load = useCallback(() => {
    Promise.all([venturesApi.detail(id), ledgerApi.byVenture(id)]).then(([vRes, lRes]) => {
      setV(vRes.data); setEvents(lRes.data)
      setIpInput(vRes.data.ipStatus || '')
    }).catch(() => navigate('/ventures')).finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => { load() }, [load])

  const act = async (fn, ...args) => {
    setActionError('')
    try { await fn(...args); load() }
    catch (err) { setActionError(err.response?.data?.error || 'Action failed') }
  }

  const advanceStage = async () => {
    setAdvancing(true)
    await act(venturesApi.advanceStage, id)
    setAdvancing(false)
  }

  const addMember = async e => {
    e.preventDefault()
    await act(venturesApi.addMember, id, memberUsername)
    setMemberUsername(''); setAddingMember(false)
  }

  const addMilestone = async e => {
    e.preventDefault()
    await act(venturesApi.addMilestone, id, milestoneTitle)
    setMilestoneTitle(''); setAddingMilestone(false)
  }

  const updateMilestone = (mid, status) => act(venturesApi.updateMilestone, mid, status)

  const saveIp = async e => {
    e.preventDefault()
    await act(venturesApi.updateIpStatus, id, ipInput)
    setEditingIp(false)
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-600"><Spinner /></div>
  if (!v) return null

  const curIdx = VENTURE_STAGES.indexOf(v.stage)
  const isLast = curIdx >= VENTURE_STAGES.length - 1

  return (
    <div className="max-w-6xl mx-auto space-y-5 fade-in">
      <div>
        <button onClick={() => navigate('/ventures')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Venture Rooms
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">{v.title}</h1>
            <p className="text-sm text-gray-400 max-w-2xl">{v.description}</p>
          </div>
          {v.isMember && !isLast && (
            <button onClick={advanceStage} disabled={advancing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0 ml-4">
              {advancing ? <Spinner /> : '→'} Advance Stage
            </button>
          )}
        </div>
      </div>

      {actionError && <ErrorBox msg={actionError} />}
      {error && <ErrorBox msg={error} />}

      {/* Stage Pipeline */}
      <Card cls="p-5">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm font-semibold text-white">Stage Pipeline</span>
          <span className="ml-auto text-xs text-gray-500">Stage {curIdx + 1} of {VENTURE_STAGES.length}</span>
        </div>
        <div className="flex items-center">
          {VENTURE_STAGES.map((st, idx) => {
            const done = idx < curIdx, curr = idx === curIdx, future = idx > curIdx
            return (
              <div key={st} className="flex items-center flex-1 min-w-0">
                <div className={`flex flex-col items-center flex-shrink-0 ${future ? 'opacity-40' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${done ? 'bg-emerald-500 border-emerald-500' : curr ? 'bg-indigo-500 border-indigo-500' : 'bg-gray-800 border-gray-700'}`}>
                    {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : curr ? <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      : <div className="w-2 h-2 rounded-full bg-gray-600"></div>}
                  </div>
                  <span className={`text-xs mt-2 text-center leading-tight max-w-[4rem] ${curr ? 'text-indigo-300 font-semibold' : done ? 'text-emerald-400' : 'text-gray-600'}`}>{st}</span>
                </div>
                {idx < VENTURE_STAGES.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded-full ${idx < curIdx ? 'bg-emerald-500' : 'bg-gray-800'}`}></div>}
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* Milestones */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-white">✅ Milestones</span>
              <span className="text-xs text-gray-500">{v.milestones.filter(m => m.status === 'DONE').length}/{v.milestones.length} completed</span>
              {v.isMember && (
                <button onClick={() => setAddingMilestone(a => !a)} className="ml-auto text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
              )}
            </div>

            {addingMilestone && (
              <form onSubmit={addMilestone} className="flex gap-2 mb-3">
                <input value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)} required autoFocus
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Milestone title…" />
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl">Add</button>
                <button type="button" onClick={() => setAddingMilestone(false)} className="px-3 py-2 text-gray-500 hover:text-gray-300 text-sm">✕</button>
              </form>
            )}

            <Card cls="divide-y divide-gray-800">
              {v.milestones.length === 0 ? (
                <p className="text-center text-gray-600 text-sm py-6">No milestones yet.</p>
              ) : v.milestones.map(m => (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3.5">
                  <button onClick={() => v.isMember && updateMilestone(m.id, m.status === 'DONE' ? 'PENDING' : m.status === 'ACTIVE' ? 'DONE' : 'ACTIVE')}
                    disabled={!v.isMember} className="flex-shrink-0">
                    {m.status === 'DONE'
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      : m.status === 'ACTIVE'
                      ? <div className="w-4 h-4 rounded-full border-2 border-indigo-500 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 pulse"></div></div>
                      : <div className="w-4 h-4 rounded-full border-2 border-gray-700"></div>}
                  </button>
                  <p className={`flex-1 text-sm ${m.status === 'DONE' ? 'text-gray-400 line-through' : m.status === 'ACTIVE' ? 'text-white font-medium' : 'text-gray-500'}`}>{m.title}</p>
                  <div className="flex-shrink-0 text-xs text-gray-600">
                    {m.status === 'DONE' && m.completedAt ? fmtDate(m.completedAt) : ''}
                    {m.status === 'ACTIVE' && <Chip cls="bg-indigo-500/20 text-indigo-300">In Progress</Chip>}
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* IP Status */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-amber-300">🔒 IP Status</p>
              {v.isMember && <button onClick={() => setEditingIp(e => !e)} className="text-xs text-amber-400 hover:text-amber-300">Edit</button>}
            </div>
            {editingIp ? (
              <form onSubmit={saveIp} className="flex gap-2 mt-2">
                <input value={ipInput} onChange={e => setIpInput(e.target.value)} autoFocus
                  className="flex-1 bg-gray-800 border border-amber-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Provisional patent filed (SG 2025-001234)" />
                <button className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-xl">Save</button>
                <button type="button" onClick={() => setEditingIp(false)} className="px-2 text-gray-500 hover:text-gray-300 text-sm">✕</button>
              </form>
            ) : (
              <p className="text-sm text-gray-300">{v.ipStatus || <span className="text-gray-600 italic">Not set</span>}</p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">👥 Members</p>
              {v.isMember && <button onClick={() => setAddingMember(a => !a)} className="text-xs text-indigo-400 hover:text-indigo-300">+ Invite</button>}
            </div>
            {addingMember && (
              <form onSubmit={addMember} className="flex gap-2 mb-3">
                <input value={memberUsername} onChange={e => setMemberUsername(e.target.value)} required autoFocus
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Username…" />
                <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl">Add</button>
                <button type="button" onClick={() => setAddingMember(false)} className="px-2 text-gray-500 text-sm">✕</button>
              </form>
            )}
            <Card cls="divide-y divide-gray-800">
              {v.members.map(m => (
                <div key={m.userId} className="flex items-center gap-3 px-4 py-3.5">
                  <Avatar initials={m.avatar || m.username.substring(0, 2).toUpperCase()} size="w-8 h-8" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{m.username}</p>
                    <p className="text-xs text-gray-600 truncate">{m.institution || '—'}</p>
                  </div>
                  <Chip cls={ROLE_TEXT[m.role] || 'bg-gray-700 text-gray-400'}>{m.role}</Chip>
                </div>
              ))}
            </Card>
          </div>

          {/* Trust Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">🔒 Trust Events</p>
              <button onClick={() => navigate('/ledger')} className="text-xs text-indigo-400 hover:text-indigo-300">Full ledger →</button>
            </div>
            <Card cls="p-4 space-y-3">
              {events.length === 0
                ? <p className="text-center text-gray-600 text-sm py-2">No events yet.</p>
                : events.slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg ${EVT_STYLE[e.type] || 'bg-gray-800 text-gray-500'} flex items-center justify-center flex-shrink-0 text-xs`}>●</div>
                    <div>
                      <p className="text-xs text-gray-300 leading-snug">{e.detail}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{fmtDate(e.timestamp)}</p>
                    </div>
                  </div>
                ))}
            </Card>
          </div>

          <button onClick={() => navigate('/audit')}
            className="w-full bg-violet-900/20 border border-violet-500/20 rounded-2xl p-4 text-left hover:border-violet-500/40 transition-colors group">
            <p className="text-xs font-semibold text-violet-300 mb-1">✨ Run AI Audit</p>
            <p className="text-xs text-gray-500 mb-2">Get commercialization analysis and risk detection for this venture.</p>
            <span className="text-xs text-violet-400 group-hover:text-violet-300 font-medium">Open AI Audit →</span>
          </button>
        </div>
      </div>
    </div>
  )
}
