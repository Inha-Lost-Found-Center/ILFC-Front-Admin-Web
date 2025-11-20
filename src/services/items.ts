import { http } from './http'
import type { Item } from '../types/item'

export type CreateItemRequest = {
  location: string
  status: Item['status']
  tags: string[]
  description?: string
  photo_urls: string[]
}

export type UpdateItemRequest = Partial<CreateItemRequest>

export const ItemsService = {
  getAll() {
    return http.get<Item[]>('/items/').then((r) => r.data)
  },
  getById(id: number) {
    return http.get<Item>(`/items/${id}`).then((r) => r.data)
  },
  create(data: CreateItemRequest) {
    return http.post<Item>('/items/', data).then((r) => r.data)
  },
  update(id: number, data: UpdateItemRequest) {
    return http.patch<Item>(`/items/${id}`, data).then((r) => r.data)
  },
  delete(id: number) {
    return http.delete<void>(`/items/${id}`).then((r) => r.data)
  },
  adminRegister(data: { photo_url: string; device_name?: string | null; location: string; description: string; tags: string[] }) {
    return http.post<Item>('/admin/items', data).then((r) => r.data)
  },
}

