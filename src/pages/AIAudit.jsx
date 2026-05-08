import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import { audit as auditApi } from '../api'
import { Card, Chip, RISK_STYLE, ErrorBox, Spinner } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'

// Use the bundled worker so Vite can resolve it correctly
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

const STEPS = [
  'Parsing research content…',
  'Extracting technical claims…',
  'Cross-referencing market data…',
  'Running risk rule engine…',
  'Generating structured audit report…',
]

const DEMO = `Title: Bio-Degradable Polymer Solar Cells with 18.3% Efficiency

Abstract: We present a novel photovoltaic material composed of 92% biodegradable polymer substrates combined with earth-abundant donor-acceptor conjugated polymers. Lab-scale devices demonstrate 18.3% power conversion efficiency under AM1.5G illumination. The polymer matrix enables full biodegradation within 24 months under controlled composting conditions, addressing critical end-of-life concerns for conventional silicon panels.`

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map(item => item.str).join(' '))
  }
  return pages.join('\n')
}

export default function AIAudit() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [input, setInput] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [dragging, setDragging] = useState(false)

  const [phase, setPhase] = useState('idle') // idle | loading | result
  const [step, setStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [expRisk, setExpRisk] = useState(null)
  const [expApp, setExpApp] = useState(null)

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setPdfError('Please select a valid PDF file.')
      return
    }
    setPdfError('')
    setPdfLoading(true)
    setPdfName(file.name)
    try {
      const text = await extractPdfText(file)
      setInput(text)
    } catch {
      setPdfError('Failed to extract text from PDF. The file may be scanned or encrypted.')
      setPdfName('')
    } finally {
      setPdfLoading(false)
    }
  }

  const onFileChange = (e) => handleFile(e.target.files?.[0])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const clearPdf = () => {
    setPdfName('')
    setInput('')
    setPdfError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const run = async () => {
    if (!input.trim()) return
    setError(''); setPhase('loading'); setStep(0); setResult(null)

    let s = 0
    const interval = setInterval(() => {
      s++
      if (s < STEPS.length) setStep(s)
      else clearInterval(interval)
    }, 700)

    try {
      const { data } = await auditApi.run(input, null)
      clearInterval(interval)
      setResult(data)
      setPhase('result')
    } catch (err) {
      clearInterval(interval)
      setError(err.response?.data?.error || 'Audit failed')
      setPhase('idle')
    }
  }

  const reset = () => {
    setPhase('idle'); setInput(''); setResult(null)
    setPdfName(''); setPdfError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!user?.hasApiKey) return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card cls="p-8 text-center">
        <p className="text-4xl mb-4">🔑</p>
        <h2 className="text-lg font-bold text-white mb-2">API Key Required</h2>
        <p className="text-gray-500 text-sm mb-5">Add your OpenAI API key in Settings to enable the AI Commercialization Audit.</p>
        <button onClick={() => navigate('/settings')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors">
          Go to Settings →
        </button>
      </Card>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <div>
        <h1 className="text-xl font-bold text-white mb-1 flex items-center gap-2">✨ AI Commercialization Audit</h1>
        <p className="text-gray-500 text-sm">Upload a research PDF for a full-paper analysis, or paste text below. AI extracts commercial insights, flags risks, and suggests validation actions — all with reasoning attached.</p>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
        <span className="text-indigo-400 text-xs mt-0.5">ℹ️</span>
        <p className="text-xs text-gray-400"><span className="text-indigo-300 font-medium">Explainability-first: </span>Every output includes reasoning. No black-box scores. Powered by {`gpt-4o-mini`} via your API key.</p>
      </div>

      {phase === 'idle' && (
        <div className="space-y-4">
          <ErrorBox msg={error} />

          {/* PDF Upload Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !pdfName && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl px-6 py-8 text-center transition-colors cursor-pointer
              ${dragging ? 'border-indigo-500 bg-indigo-500/10' : pdfName ? 'border-emerald-500/40 bg-emerald-500/5 cursor-default' : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onFileChange}
            />

            {pdfLoading ? (
              <div className="flex flex-col items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" className="spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                <p className="text-sm text-gray-400">Extracting text from PDF…</p>
              </div>
            ) : pdfName ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-xs">{pdfName}</p>
                    <p className="text-xs text-emerald-400 mt-0.5">{Math.round(input.length / 5)} words extracted</p>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); clearPdf() }}
                  className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Upload PDF paper</p>
                  <p className="text-xs text-gray-600 mt-1">Drag & drop or click to browse · Full paper analysis</p>
                </div>
              </div>
            )}
          </div>

          {pdfError && <p className="text-xs text-red-400 -mt-2">{pdfError}</p>}

          {/* Manual text fallback */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 bg-gray-800"></div>
              <span className="text-xs text-gray-600">or paste text</span>
              <div className="h-px flex-1 bg-gray-800"></div>
            </div>
            <textarea
              value={pdfName ? '' : input}
              onChange={e => { setPdfName(''); setInput(e.target.value) }}
              disabled={!!pdfName}
              rows={6}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none disabled:opacity-40 disabled:cursor-not-allowed"
              placeholder="Paste your research title and abstract here…"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={run}
              disabled={!(pdfName ? input.trim() : input.trim())}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              ✨ Run AI Audit
            </button>
            {!pdfName && (
              <button
                onClick={() => setInput(DEMO)}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-colors"
              >
                Load Demo Paper
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'loading' && (
        <Card cls="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" className="spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            </div>
            <h3 className="font-semibold text-white mb-1">AI Audit in progress</h3>
            <p className="text-sm text-gray-500 mb-8">Analyzing via OpenAI · This takes 5–15 seconds</p>
            <div className="w-full max-w-sm space-y-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {i < step
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      : i === step
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" className="spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                        : <div className="w-3.5 h-3.5 rounded-full border border-gray-700"></div>}
                  </div>
                  <span className={`text-xs ${i < step ? 'text-emerald-400' : i === step ? 'text-violet-300' : 'text-gray-700'}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {phase === 'result' && result && (
        <div className="space-y-5 fade-in">
          <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span className="text-sm font-medium text-emerald-300">Audit complete — logged to Trust Ledger</span>
            </div>
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300">
              New audit →
            </button>
          </div>

          <Card cls="p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"></span>Commercial Summary</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{result.summary}</p>
          </Card>

          {result.applications && (
            <Card cls="p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>Application Hypotheses</h3>
              <div className="space-y-2">
                {result.applications.map((a, i) => (
                  <div key={i} className="border border-gray-800 rounded-xl overflow-hidden">
                    <button onClick={() => setExpApp(expApp === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">{a.name}</span>
                        <Chip cls={a.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}>{a.confidence} confidence</Chip>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono">{a.market}</span>
                        <span className="text-gray-500">{expApp === i ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expApp === i && <div className="px-4 pb-3 bg-gray-800/30 border-t border-gray-800"><p className="text-xs text-gray-400 mt-2 leading-relaxed">{a.reasoning}</p></div>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result.claims && (
            <Card cls="p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>Verified vs Assumed Claims</h3>
              <div className="space-y-2">
                {result.claims.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                    {c.status === 'VERIFIED'
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" className="flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200">{c.claim}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{c.source}</p>
                    </div>
                    <Chip cls={c.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}>{c.status}</Chip>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result.risks && (
            <Card cls="p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>Risk Analysis</h3>
              <div className="space-y-2">
                {result.risks.map((r, i) => {
                  const s = RISK_STYLE[r.level] || RISK_STYLE.LOW
                  return (
                    <div key={i} className={`border rounded-xl overflow-hidden ${s.bg}`}>
                      <button onClick={() => setExpRisk(expRisk === i ? null : i)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                        <Chip cls={s.badge}>{r.level}</Chip>
                        <span className="text-sm font-medium text-gray-200 flex-1">{r.risk}</span>
                        <span className="text-gray-500">{expRisk === i ? '▲' : '▼'}</span>
                      </button>
                      {expRisk === i && <div className="px-4 pb-3 border-t border-gray-800/50"><p className="text-xs text-gray-400 mt-2 leading-relaxed">{r.detail}</p></div>}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {result.actions && (
            <Card cls="p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>Recommended Validation Actions</h3>
              <div className="space-y-3">
                {result.actions.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-indigo-400">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
