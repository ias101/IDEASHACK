import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auth as authApi } from '../api'
import { ErrorBox, Spinner, ROLE_GRAD } from '../components/ui'

const ROLES = [
  { value: 'RESEARCHER', label: 'Researcher', icon: '🔬', grad: ROLE_GRAD.RESEARCHER, desc: 'Publish research, protect IP, find business partners' },
  { value: 'BUSINESS',   label: 'Business',   icon: '💼', grad: ROLE_GRAD.BUSINESS,   desc: 'Source verified deep-tech opportunities' },
  { value: 'INVESTOR',   label: 'Investor',   icon: '📈', grad: ROLE_GRAD.INVESTOR,   desc: 'Access due-diligence-ready, audited ventures' },
]

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'RESEARCHER', institution: '', department: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.role) { setError('Please select a role'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await authApi.register(form)
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ background: '#030712' }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">@</div>
          <span className="text-xl font-bold text-white">platform</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-6">Join the trust-first science commercialization platform</p>

          <form onSubmit={submit} className="space-y-5">
            <ErrorBox msg={error} />

            {/* Role selector */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-2 block">Your Role *</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button type="button" key={r.value} onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`p-3 rounded-xl border text-left transition-all ${form.role === r.value ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${r.grad} flex items-center justify-center mb-2 text-lg`}>{r.icon}</div>
                    <p className="text-xs font-semibold text-white">{r.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Username *</label>
                <input value={form.username} onChange={set('username')} required minLength={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  placeholder="dr.chen" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Email *</label>
                <input type="email" value={form.email} onChange={set('email')} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  placeholder="you@org.edu" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Password *</label>
              <input type="password" value={form.password} onChange={set('password')} required minLength={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                placeholder="Min. 6 characters" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Institution</label>
                <input value={form.institution} onChange={set('institution')}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  placeholder="National University…" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Department</label>
                <input value={form.department} onChange={set('department')}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  placeholder="Materials Science…" />
              </div>
            </div>

            <button disabled={loading} className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
              {loading ? <><Spinner /> Creating account…</> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
