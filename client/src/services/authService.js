import api from './api'

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response
  },

  async resendRegistrationOTP(email) {
    const response = await api.post('/auth/resend-registration-otp', { email })
    return response
  },

  async verifyRegistrationOTP(email, otp) {
    const response = await api.post('/auth/verify-registration-otp', { email, otp })
    return response
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data.user
  },

  async verifyMasterPassword(masterPassword) {
    const response = await api.post('/auth/verify-master', { masterPassword })
    return response
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response
  },

  async verifyOTP(email, otp) {
    const response = await api.post('/auth/verify-otp', { email, otp })
    return response
  },

  async resetPassword(email, otp, password) {
    const response = await api.post('/auth/reset-password', { email, otp, password })
    return response
  },

  async enable2FA(password) {
    const response = await api.post('/auth/enable-2fa', { password })
    return response
  },

  async verify2FASetup(otp) {
    const response = await api.post('/auth/verify-2fa-setup', { otp })
    return response
  },

  async disable2FA(password) {
    const response = await api.post('/auth/disable-2fa', { password })
    return response
  }
}