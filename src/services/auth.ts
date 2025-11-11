import { http } from './http'
import type { LoginRequest, LoginResponse, Tokens } from '../types/auth'

export const AuthService = {
  login(data: LoginRequest) {
    console.log('Login request:', data)
    console.log('Login URL:', `${http.defaults.baseURL}/users/login`)
    
    return http.post<LoginResponse>('/users/login', data)
      .then((r) => {
        console.log('Login response:', r.data)
        const response = r.data
        // API 응답을 내부 토큰 형식으로 변환
        const tokens: Tokens = {
          access_token: response.access_token,
        }
        return tokens
      })
      .catch((error) => {
        console.error('Login error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        })
        throw error
      })
  },
  refresh(refreshToken: string) {
    return http.post<LoginResponse>('/users/refresh', { refreshToken }).then((r) => {
      const response = r.data
      const tokens: Tokens = {
        access_token: response.access_token,
        refreshToken,
      }
      return tokens
    })
  },
  logout() {
    return http.post<void>('/users/logout')
  },
}



