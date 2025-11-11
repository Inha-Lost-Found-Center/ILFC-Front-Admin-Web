import { http } from './http'
import type { LoginRequest, LoginResponse, Tokens } from '../types/auth'

export const AuthService = {
  login(data: LoginRequest) {
    return http.post<LoginResponse>('/users/login', data).then((r) => {
      const response = r.data
      // API 응답을 내부 토큰 형식으로 변환
      const tokens: Tokens = {
        access_token: response.access_token,
      }
      return tokens
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



