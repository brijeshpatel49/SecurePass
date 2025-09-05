import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Layout from './components/Layout'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOTP from './pages/VerifyOTP'
import ForgotPassword from './pages/ForgotPassword'
import ForgotPasswordOTP from './pages/ForgotPasswordOTP'
import Dashboard from './pages/Dashboard'
import Passwords from './pages/Passwords'
import Settings from './pages/Settings'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/verify-otp" element={user ? <Navigate to="/dashboard" replace /> : <VerifyOTP />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
        <Route path="/forgot-password-otp" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordOTP />} />
        {user ? (
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="passwords" element={<Passwords />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        ) : (
          <>
            <Route path="/dashboard" element={<Navigate to="/login" replace />} />
            <Route path="/passwords" element={<Navigate to="/login" replace />} />
            <Route path="/settings" element={<Navigate to="/login" replace />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App