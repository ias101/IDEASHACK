import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ventures as venturesApi } from '../api'
import { Card, Chip, STAGE_BADGE, Spinner, ErrorBox } from '../components/ui'

export default function Ventures() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const load = () => venturesApi.list().then(({ data }) => setList(data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const create = async e => {
    e.preventDefault()
    if (!form.title.trim()) return
    setCreating(true); setError('')
    try {
      const { data } = await venturesApi.create(form)
      setShowForm(false); setForm({ title: '', description: '' })
      navigate(`/ventures/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create venture')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Venture Rooms</h1>
          <p className="text-gray-500 text-sm">Stage-gated collaboration spaces with IP protection and trust logging</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors">
          + New Venture
        </button>
      </div>

      {showForm && (
        <Card cls="p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Create Venture Room</h2>
          <form onSubmit={create} className="space-y-4">
            <ErrorBox msg={error} />
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Bio-Degradable Polymer Solar Cells" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Brief summary of the research or technology…" />
            </div>
            <div className="flex items-center gap-3">
              <button disabled={creating} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl">
                {creating ? <><Spinner /> Creating…</> : 'Create Venture Room'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError('') }}
                className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-600"><Spinner /></div>
      ) : list.length === 0 ? (
        <Card cls="p-12 text-center">
          <p className="text-4xl mb-4">🌿</p>
          <p className="text-gray-400 font-medium mb-1">No venture rooms yet</p>
          <p className="text-gray-600 text-sm mb-5">Create your first venture room to start collaborating</p>
          <button onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors">
            Create Venture Room
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map(v => (
            <div key={v.id} onClick={() => navigate(`/ventures/${v.id}`)}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 cursor-pointer hover:border-gray-700 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">{v.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{v.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Chip cls={STAGE_BADGE[v.stage] || 'bg-gray-700 text-gray-300'}>{v.stage}</Chip>
                  <span className="text-xs text-gray-600">{v.memberCount} members</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${((v.stageIndex + 1) / 6) * 100}%`, background: 'linear-gradient(to right,#6366f1,#8b5cf6)' }}></div>
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">{v.milestonesDone}/{v.milestonesTotal} milestones</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
