import { useState, useEffect } from 'react'
import { users as usersApi } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Card, ErrorBox, Spinner } from '../components/ui'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({ institution: '', department: '' })
  const [apiKey, setApiKey] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [keyMsg, setKeyMsg] = useState(null)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    usersApi.me().then(({ data }) => {
      setProfile(data)
      setProfileForm({ institution: data.institution, department: data.department })
    })
  }, [])

  const saveProfile = async e => {
    e.preventDefault()
    setSavingProfile(true); setProfileMsg(null)
    try {
      const { data } = await usersApi.update(profileForm)
      setProfile(data)
      refreshUser({ ...user, institution: data.institution })
      setProfileMsg({ ok: true, text: 'Profile updated.' })
    } catch (err) {
      setProfileMsg({ ok: false, text: err.response?.data?.error || 'Update failed' })
    } finally {
      setSavingProfile(false)
    }
  }

  const saveApiKeyFn = async e => {
    e.preventDefault()
    setSavingKey(true); setKeyMsg(null)
    try {
      await usersApi.saveApiKey(apiKey.trim())
      setApiKey('')
      const { data } = await usersApi.me()
      setProfile(data)
      refreshUser({ ...user, hasApiKey: data.hasApiKey })
      setKeyMsg({ ok: true, text: 'API key saved.' })
    } catch (err) {
      setKeyMsg({ ok: false, text: err.response?.data?.error || 'Save failed' })
    } finally {
      setSavingKey(false)
    }
  }

  const removeKey = async () => {
    if (!confirm('Remove your stored API key?')) return
    await usersApi.saveApiKey('')
    const { data } = await usersApi.me()
    setProfile(data)
    refreshUser({ ...user, hasApiKey: false })
    setKeyMsg({ ok: true, text: 'API key removed.' })
  }

  if (!profile) return <div className="flex items-center justify-center h-40 text-gray-600">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your profile and API configuration</p>
      </div>

      {/* Profile */}
      <Card cls="p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Profile Information</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          {profileMsg && (
            <div className={`px-4 py-2.5 rounded-xl text-sm border ${profileMsg.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
              {profileMsg.text}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Username</label>
              <div className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-400">{profile.username}</div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <div className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-400">{profile.email}</div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Role</label>
              <div className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-400">{profile.role}</div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Institution</label>
            <input value={profileForm.institution} onChange={e => setProfileForm(f => ({ ...f, institution: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="Your institution or company" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Department</label>
            <input value={profileForm.department} onChange={e => setProfileForm(f => ({ ...f, department: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="Department or team" />
          </div>
          <button disabled={savingProfile} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
            {savingProfile ? <><Spinner /> Saving…</> : 'Save Profile'}
          </button>
        </form>
      </Card>

      {/* OpenAI API Key */}
      <Card cls="p-6">
        <div className="flex items-start gap-3 mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">OpenAI API Key</h2>
            <p className="text-xs text-gray-500">Required to use the AI Commercialization Audit. Your key is stored locally in the H2 database and never shared.</p>
          </div>
        </div>

        {profile.hasApiKey && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div className="flex-1">
              <p className="text-xs font-medium text-emerald-300">API key configured</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {showKey ? profile.maskedApiKey : '••••••••••••••••••••'}
              </p>
            </div>
            <button onClick={() => setShowKey(s => !s)} className="text-xs text-gray-500 hover:text-gray-300">
              {showKey ? 'Hide' : 'Show'}
            </button>
            <button onClick={removeKey} className="text-xs text-red-400 hover:text-red-300 ml-2">Remove</button>
          </div>
        )}

        {keyMsg && (
          <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm border ${keyMsg.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
            {keyMsg.text}
          </div>
        )}

        <form onSubmit={saveApiKeyFn} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              {profile.hasApiKey ? 'Replace API Key' : 'Enter API Key'}
            </label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono"
              placeholder="sk-..." />
          </div>
          <div className="flex items-center gap-3">
            <button disabled={savingKey || !apiKey.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
              {savingKey ? <><Spinner /> Saving…</> : 'Save API Key'}
            </button>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300">
              Get a key from OpenAI →
            </a>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">🔒 Your API key is stored encrypted in the local H2 database. Calls are proxied through the backend and never exposed to the browser.</p>
        </div>
      </Card>

      {/* Danger zone */}
      <Card cls="p-6 border-red-900/30">
        <h2 className="text-sm font-semibold text-red-400 mb-3">Account</h2>
        <p className="text-xs text-gray-500 mb-3">You are signed in as <span className="text-white">{profile.username}</span> ({profile.email}).</p>
        <button onClick={() => { if (confirm('Sign out?')) { window.location.href = '/login' } }}
          className="px-4 py-2 text-xs text-red-400 border border-red-900/50 hover:border-red-500/50 rounded-lg transition-colors">
          Sign Out
        </button>
      </Card>
    </div>
  )
}
