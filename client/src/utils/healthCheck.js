import api from '../services/api'

export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health')
    return true
  } catch (error) {
    console.error('❌ Server health check failed:', error.message)
    return false
  }
}