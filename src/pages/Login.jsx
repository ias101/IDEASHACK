import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auth as authApi } from '../api'
import { ErrorBox, Spinner } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#030712' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">@</div>
          <span className="text-xl font-bold text-white">platform</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your username/email and password</p>

          <form onSubmit={submit} className="space-y-4">
            <ErrorBox msg={error} />
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Username or Email</label>
              <input value={form.usernameOrEmail} onChange={set('usernameOrEmail')} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                placeholder="dr.chen or s.chen@nus.edu.sg" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Password</label>
              <input type="password" value={form.password} onChange={set('password')} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                placeholder="••••••••" />
            </div>
            <button disabled={loading} className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
              {loading ? <><Spinner /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Create one →</Link>
        </p>
      </div>
    </div>
  )
}
