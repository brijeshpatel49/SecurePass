import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    
    // Handle unauthorized errors, but exclude master password verification errors
    if (error.response?.status === 401) {
      const isTokenError = message.includes('Token') || message.includes('token') || 
                          message.includes('Access denied') || message.includes('not valid')
      const isMasterPasswordError = message.includes('master password') || message.includes('Master password')
      
      // Only logout for token-related errors, not master password errors
      if (isTokenError && !isMasterPasswordError) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(new Error(message))
  }
)

export default api