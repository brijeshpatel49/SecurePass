import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useMasterPassword } from '../context/MasterPasswordContext'
import { X, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

const MasterPasswordModal = ({ onClose, onVerify }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { verifyMasterPassword } = useAuth()
  const { recordFailedAttempt, resetAttempts, getRemainingAttempts, isLocked } = useMasterPassword()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    if (isLocked()) {
      toast.error('Too many failed attempts. Please log in again.')
      return
    }

    try {
      setLoading(true)
      const result = await verifyMasterPassword(data.masterPassword)
      
      if (result.success) {
        resetAttempts() // Reset on successful verification
        onVerify(data.masterPassword)
      } else {
        const canContinue = recordFailedAttempt()
        if (!canContinue) {
          onClose() // Close modal before logout
        }
      }
    } catch (error) {
      const canContinue = recordFailedAttempt()
      if (!canContinue) {
        onClose() // Close modal before logout
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="card max-w-md w-full animate-scale-in">
        <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Master Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verification Required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Please enter your master password to access or modify your encrypted passwords.
          </p>
          
          {getRemainingAttempts() < 3 && (
            <div className="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                {getRemainingAttempts()} attempt{getRemainingAttempts() !== 1 ? 's' : ''} remaining
              </p>
            </div>
          )}

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Master Password
            </label>
            <div className="relative">
              <input
                {...register('masterPassword', {
                  required: 'Master password is required'
                })}
                type={showPassword ? 'text' : 'password'}
                className="input pr-12 text-lg"
                placeholder="Enter your master password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.masterPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.masterPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" inline />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MasterPasswordModal