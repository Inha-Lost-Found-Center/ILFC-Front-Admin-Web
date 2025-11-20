import { http } from './http'

export type LockerStatus = {
  door: 'OPEN' | 'CLOSED'
  lastOpenedAt?: string
  battery?: number
  temperature?: number
}

export type LockerOpenLog = {
  id: string
  lockerId: string
  actorId?: string
  result: 'OPENED' | 'INVALID_CODE' | 'LOCKED' | 'HARDWARE_ERROR'
  occurredAt: string
  ip?: string
}

export const AdminLockersService = {
  open(lockerId: string, code: string) {
    return http.post<{ data: { result: LockerOpenLog['result']; openedAt?: string } }>(
      `/admin/lockers/${lockerId}/open`,
      { code }
    ).then((r) => r.data)
  },
  status(lockerId: string) {
    return http.get<{ data: LockerStatus }>(`/admin/lockers/${lockerId}/status`).then((r) => r.data)
  },
  validateCode(lockerId: string, code: string) {
    return http.post<{ data: { valid: boolean; itemId?: string; expiresAt?: string } }>(
      `/admin/lockers/${lockerId}/codes/validate`,
      { code }
    ).then((r) => r.data)
  },
  openLogs(params?: { lockerId?: string; from?: string; to?: string; result?: string; page?: number; size?: number }) {
    return http.get<{ data: LockerOpenLog[]; pagination?: unknown }>(`/admin/lockers/open-logs`, { params }).then((r) => r.data)
  }
}



