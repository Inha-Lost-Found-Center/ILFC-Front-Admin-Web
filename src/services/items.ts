import { http } from './http'
import type { Item } from '../types/item'

export const ItemsService = {
  getAll() {
    return http.get<Item[]>('/items/').then((r) => r.data)
  },
}

