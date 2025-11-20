import axios from 'axios'
import { useAuthStore } from '../store/auth'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: import.meta.env.VITE_USE_CREDENTIALS === 'true',
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.access_token
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }

  if (config.url?.includes('/admin/login')) {
    console.log('Admin login request', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    })
  }

  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const isAuthEndpoint = String(error.config?.url || '').includes('/admin/login')

    if (status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().setTokens(null)
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)
