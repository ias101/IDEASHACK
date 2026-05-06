import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#030712' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
