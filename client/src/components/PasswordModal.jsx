import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { passwordService } from '../services/passwordService'
import { 
  XMarkIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowPathIcon, 
  ClipboardDocumentIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  KeyIcon
} from '@heroicons/react/24/outline'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'
import { validatePassword } from '../utils/passwordValidation'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'
import MasterPasswordModal from './MasterPasswordModal'

const PasswordModal = ({ password, onClose, onSave }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false)
  const [masterPassword, setMasterPassword] = useState('')
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      email: '',
      password: ''
    }
  })

  const watchedPassword = watch('password')
  const passwordValidation = watchedPassword ? validatePassword(watchedPassword) : null

  useEffect(() => {
    if (password) {
      setValue('title', password.title || '')
      setValue('email', password.email || '')
      setValue('password', password.password || '')
    }
  }, [password, setValue])

  const generatePassword = () => {
    const length = 16
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    setValue('password', password)
    toast.success('Password generated')
  }

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(watchedPassword)
      toast.success('Password copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy password')
    }
  }



  const handleMasterPasswordVerified = (verifiedMasterPassword) => {
    setMasterPassword(verifiedMasterPassword)
    setShowMasterPasswordModal(false)
  }

  const onSubmit = async (data) => {
    if (!masterPassword) {
      setShowMasterPasswordModal(true)
      return
    }

    try {
      setLoading(true)
      const passwordData = {
        ...data,
        masterPassword,
        title: data.title || 'Untitled'
      }

      if (password) {
        await passwordService.updatePassword(password._id, passwordData)
        toast.success('Password updated successfully')
      } else {
        await passwordService.createPassword(passwordData)
        toast.success('Password created successfully')
      }
      
      onSave()
    } catch (error) {
      toast.error(error.message || 'Failed to save password')
    } finally {
      setLoading(false)
    }
  }



  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
          <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <KeyIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {password ? 'Edit Password' : 'Add Password'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {password ? 'Update your credentials' : 'Save your new credentials'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            <div className="space-y-6">
              {/* App/Website Name */}
              <div>
                <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="w-4 h-4 text-white" />
                  </div>
                  <span>App or Website *</span>
                </label>
                <input
                  {...register('title', { required: 'App or website name is required' })}
                  type="text"
                  className="input text-lg"
                  placeholder="e.g., Gmail, Facebook, GitHub"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                )}
              </div>

              {/* Email/Username */}
              <div>
                <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <EnvelopeIcon className="w-4 h-4 text-white" />
                  </div>
                  <span>Email/Username</span>
                </label>
                <input
                  {...register('email')}
                  type="text"
                  className="input text-lg"
                  placeholder="your.email@example.com or username"
                />
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <KeyIcon className="w-4 h-4 text-white" />
                  </div>
                  <span>Password *</span>
                </label>
                <div className="relative">
                  <input
                    {...register('password', { 
                      required: 'Password is required'
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-32 text-lg font-mono"
                    placeholder="Enter or generate password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-4">
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      title="Copy password"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                      title="Generate password"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-1 rounded"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
                {watchedPassword && (
                  <div className="mt-3 space-y-3">
                    <PasswordStrengthIndicator password={watchedPassword} showDetails={false} />
                    
                    {/* Password Suggestion */}
                    {passwordValidation && !passwordValidation.isValid && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                              Password Security Suggestion
                            </h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                              Your password could be stronger. Consider improving it for better security:
                            </p>
                            <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1">
                              {!passwordValidation.checks.length && (
                                <li>• Use at least 8 characters</li>
                              )}
                              {!passwordValidation.checks.uppercase && (
                                <li>• Add uppercase letters (A-Z)</li>
                              )}
                              {!passwordValidation.checks.lowercase && (
                                <li>• Add lowercase letters (a-z)</li>
                              )}
                              {!passwordValidation.checks.number && (
                                <li>• Add numbers (0-9)</li>
                              )}
                              {!passwordValidation.checks.special && (
                                <li>• Add special characters (!@#$%^&*)</li>
                              )}
                            </ul>
                            <div className="flex items-center space-x-2 mt-3">
                              <button
                                type="button"
                                onClick={generatePassword}
                                className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors duration-200"
                              >
                                Generate Strong Password
                              </button>
                              <span className="text-xs text-amber-600 dark:text-amber-400">
                                or continue with current password
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Strong Password Confirmation */}
                    {passwordValidation && passwordValidation.isValid && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Great! Your password is strong and secure.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                  <>
                    <LoadingSpinner size="sm" inline />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <KeyIcon className="w-4 h-4" />
                    <span>{password ? 'Update' : 'Save'} Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showMasterPasswordModal && (
        <MasterPasswordModal
          onClose={() => setShowMasterPasswordModal(false)}
          onVerify={handleMasterPasswordVerified}
        />
      )}


    </>
  )
}

export default PasswordModal