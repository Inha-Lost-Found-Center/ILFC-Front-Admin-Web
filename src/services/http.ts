import axios from 'axios'
import { useAuthStore } from '../store/auth'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  // Bearer 토큰 인증을 사용하므로 withCredentials는 필요 없음
  // CORS 이슈가 있다면 백엔드 설정이 완료될 때까지 false로 설정
  withCredentials: import.meta.env.VITE_USE_CREDENTIALS === 'true',
})

// Authorization 헤더 주입
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.access_token
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
type QueueItem = { 
  resolve: (value: unknown) => void
  reject: (error: unknown) => void 
}
let pendingQueue: QueueItem[] = []

function enqueue<T>(cb: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    pendingQueue.push({ 
      resolve: resolve as (value: unknown) => void,
      reject 
    })
  }).then(() => cb())
}

function flushQueue(error?: unknown) {
  const queue = pendingQueue
  pendingQueue = []
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(undefined)
  })
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const isAuthEndpoint = String(original?.url || '').includes('/users/login') || String(original?.url || '').includes('/users/refresh')

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true
      const { tokens, setTokens } = useAuthStore.getState()
      const refreshToken = tokens?.refreshToken
      
      // refreshToken이 없으면 로그아웃 처리
      if (!refreshToken) {
        setTokens(null)
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return enqueue(() => http(original))
      }

      try {
        isRefreshing = true
        const resp = await axios.post(
          `${http.defaults.baseURL}/users/refresh`,
          { refreshToken },
          { withCredentials: import.meta.env.VITE_USE_CREDENTIALS === 'true' }
        )
        const response = resp.data
        const newTokens = {
          access_token: response.access_token,
          refreshToken,
        }
        setTokens(newTokens)
        flushQueue()
        return http(original)
      } catch (e) {
        useAuthStore.getState().setTokens(null)
        window.location.href = '/login'
        flushQueue(e)
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)


