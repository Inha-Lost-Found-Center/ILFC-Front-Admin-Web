import { http } from './http'

export type AdminUser = {
  id: string
  email: string
  name: string
  phone?: string
  role: 'ADMIN' | 'STAFF' | 'USER'
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

export const AdminUsersService = {
  list(params?: { query?: string; role?: string; status?: string; page?: number; size?: number; sort?: string }) {
    return http.get<{ data: AdminUser[]; pagination?: unknown }>('/admin/users', { params }).then((r) => r.data)
  },
  get(userId: string) {
    return http.get<{ data: AdminUser }>(`/admin/users/${userId}`).then((r) => r.data)
  },
  create(data: { email: string; password: string; name: string; phone?: string; role: AdminUser['role']; isActive?: boolean }) {
    return http.post<{ data: AdminUser }>('/admin/users', data).then((r) => r.data)
  },
  update(userId: string, data: Partial<Omit<AdminUser, 'id' | 'createdAt' | 'lastLoginAt'>>) {
    return http.put<{ data: AdminUser }>(`/admin/users/${userId}`, data).then((r) => r.data)
  },
  remove(userId: string) {
    return http.delete<{ data: { deleted: boolean } }>(`/admin/users/${userId}`).then((r) => r.data)
  },
  resetPassword(userId: string) {
    return http.post<{ data: { tempPassword?: string; resetToken?: string; expiresAt?: string } }>(`/admin/users/${userId}/password:reset`, {}).then((r) => r.data)
  },
}



