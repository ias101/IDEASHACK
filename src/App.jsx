import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'

import Login     from './pages/Login'
import Register  from './pages/Register'
import Dashboard from './pages/Dashboard'
import Ventures  from './pages/Ventures'
import VentureRoom from './pages/VentureRoom'
import AIAudit   from './pages/AIAudit'
import TrustLedger from './pages/TrustLedger'
import Passport  from './pages/Passport'
import Settings  from './pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes (Layout checks auth) */}
          <Route element={<Layout />}>
            <Route path="/dashboard"       element={<Dashboard />} />
            <Route path="/ventures"        element={<Ventures />} />
            <Route path="/ventures/:id"    element={<VentureRoom />} />
            <Route path="/audit"           element={<AIAudit />} />
            <Route path="/ledger"          element={<TrustLedger />} />
            <Route path="/passport"        element={<Passport />} />
            <Route path="/settings"        element={<Settings />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
