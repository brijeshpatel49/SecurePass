import api from './api'

export const passwordService = {
  async getPasswords(params = {}) {
    const response = await api.get('/passwords', { params })
    return response
  },

  async getPassword(id, masterPassword) {
    // Use POST for getting password with master password verification
    const response = await api.post(`/passwords/${id}/view`, { masterPassword })
    return response
  },

  async createPassword(passwordData) {
    const response = await api.post('/passwords', passwordData)
    return response
  },

  async updatePassword(id, passwordData) {
    const response = await api.put(`/passwords/${id}`, passwordData)
    return response
  },

  async deletePassword(id, masterPassword) {
    const response = await api.delete(`/passwords/${id}`, {
      data: { masterPassword }
    })
    return response
  },

  async getPasswordStats() {
    const response = await api.get('/passwords/stats')
    return response
  },

  async toggleFavorite(id) {
    const response = await api.patch(`/passwords/${id}/favorite`)
    return response
  }
}