import { useState, useEffect } from 'react'
import { ledger as ledgerApi } from '../api'
import { Card, Chip, EVT_STYLE, EVT_LABEL, Spinner, fmtDateTime } from '../components/ui'

const TYPES = ['ALL', 'ROOM_CREATED', 'MEMBER_JOIN', 'STAGE_CHANGE', 'MILESTONE_COMPLETE', 'AI_AUDIT', 'IP_REGISTERED']

export default function TrustLedger() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('ALL')

  useEffect(() => {
    ledgerApi.all().then(({ data }) => setEntries(data)).finally(() => setLoading(false))
  }, [])

  const filtered = entries.filter(e => typeFilter === 'ALL' || e.type === typeFilter)

  const counts = {
    total: entries.length,
    stageChanges: entries.filter(e => e.type === 'STAGE_CHANGE').length,
    aiAudits: entries.filter(e => e.type === 'AI_AUDIT').length,
    ipEvents: entries.filter(e => e.type === 'IP_REGISTERED' || e.type === 'IP_UPDATED').length,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-white">🔒 Trust Ledger</h1>
          <Chip cls="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Append-only</Chip>
        </div>
        <p className="text-gray-500 text-sm">Every platform action is immutably recorded here. No edits, no deletions — this is the single source of truth.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: 'Total Events', v: counts.total, c: 'text-white' },
          { l: 'Stage Changes', v: counts.stageChanges, c: 'text-emerald-400' },
          { l: 'AI Audits', v: counts.aiAudits, c: 'text-violet-400' },
          { l: 'IP Events', v: counts.ipEvents, c: 'text-amber-400' },
        ].map(({ l, v, c }) => (
          <Card key={l} cls="px-4 py-3 text-center">
            <div className={`text-xl font-bold ${c}`}>{v}</div>
            <div className="text-xs text-gray-600 mt-0.5">{l}</div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-500">Filter:</span>
        <div className="flex items-center gap-1 flex-wrap">
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${typeFilter === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {t === 'ALL' ? 'All Types' : EVT_LABEL[t] || t}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-600">{filtered.length} events</span>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl">
        <span className="text-amber-400 text-xs">🔒</span>
        <span className="text-xs text-gray-500">This ledger is <span className="text-amber-300">append-only</span>. No UPDATE or DELETE operations permitted. Each event carries a trace-id and actor attribution.</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-600"><Spinner /></div>
      ) : (
        <Card cls="overflow-hidden">
          <div className="grid px-5 py-3 border-b border-gray-800 text-xs text-gray-600 font-medium uppercase tracking-wider"
            style={{ gridTemplateColumns: '2.5rem 4rem 1fr 7rem 10rem' }}>
            <div>Type</div><div>ID</div><div>Detail</div><div>Actor</div><div>Timestamp</div>
          </div>
          <div className="divide-y divide-gray-800/60">
            {filtered.length === 0
              ? <div className="py-12 text-center text-gray-600 text-sm">No events match the current filter.</div>
              : filtered.map(e => (
                <div key={e.id} className="grid px-5 py-4 hover:bg-gray-800/30 transition-colors items-center gap-4"
                  style={{ gridTemplateColumns: '2.5rem 4rem 1fr 7rem 10rem' }}>
                  <div className={`w-7 h-7 rounded-lg ${EVT_STYLE[e.type] || 'bg-gray-800 text-gray-500'} flex items-center justify-center text-xs flex-shrink-0`}>●</div>
                  <span className="text-xs font-mono text-gray-600">#{e.id}</span>
                  <div>
                    <p className="text-sm text-gray-200 leading-snug">{e.detail}</p>
                    {e.fromStage && e.toStage && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{e.fromStage}</span>
                        <span className="text-gray-700 text-xs">→</span>
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{e.toStage}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-300">{e.actorName}</p>
                    <p className="text-xs text-gray-600">{e.actorRole}</p>
                  </div>
                  <span className="text-xs text-gray-500 font-mono leading-tight">{fmtDateTime(e.timestamp)}</span>
                </div>
              ))}
          </div>
        </Card>
      )}
      <p className="text-xs text-gray-700 text-center pb-4">End of ledger · {entries.length} total events</p>
    </div>
  )
}
