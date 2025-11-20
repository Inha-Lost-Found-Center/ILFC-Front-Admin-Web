import { http } from './http'

export type PickupLog = {
  id: number
  code: string
  is_used: boolean
  generated_at: string
  expires_at: string
  cancelled_at?: string | null
  cancel_reason?: string | null
  user_email: string
  item_description: string
  item_id: number
}

export const AdminPickupsService = {
  logs() {
    return http.get<PickupLog[]>('/admin/pickup-logs').then((r) => r.data)
  },
}



