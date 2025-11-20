import { http } from './http'
import type { LoginRequest, LoginResponse, Tokens } from '../types/auth'

export const AuthService = {
  login(data: LoginRequest) {
    return http
      .post<LoginResponse>('/admin/login', data)
      .then((r) => {
        const response = r.data
        const tokens: Tokens = {
          access_token: response.access_token,
        }
        return tokens
      })
      .catch((error) => {
        console.error('Admin login error:', {
          status: error.response?.status,
          data: error.response?.data,
        })
        throw error
      })
  },
  logout() {
    return Promise.resolve()
  },
}



