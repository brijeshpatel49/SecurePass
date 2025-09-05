import { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const MasterPasswordContext = createContext()

export const MasterPasswordProvider = ({ children }) => {
  const [attempts, setAttempts] = useState(0)
  const { logout } = useAuth()
  const MAX_ATTEMPTS = 3

  const recordFailedAttempt = () => {
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    
    const remainingAttempts = MAX_ATTEMPTS - newAttempts
    
    if (remainingAttempts > 0) {
      toast.error(`Invalid master password. ${remainingAttempts} attempts remaining.`)
    } else {
      toast.error('Too many failed attempts. Logging out for security.')
      setTimeout(() => {
        logout()
      }, 2000)
    }
    
    return remainingAttempts > 0
  }

  const resetAttempts = () => {
    setAttempts(0)
  }

  const getRemainingAttempts = () => {
    return MAX_ATTEMPTS - attempts
  }

  const isLocked = () => {
    return attempts >= MAX_ATTEMPTS
  }

  return (
    <MasterPasswordContext.Provider value={{
      attempts,
      recordFailedAttempt,
      resetAttempts,
      getRemainingAttempts,
      isLocked,
      maxAttempts: MAX_ATTEMPTS
    }}>
      {children}
    </MasterPasswordContext.Provider>
  )
}

export const useMasterPassword = () => {
  const context = useContext(MasterPasswordContext)
  if (!context) {
    throw new Error('useMasterPassword must be used within a MasterPasswordProvider')
  }
  return context
}