import { http } from './http'

export type AdminTag = {
  id: number
  name: string
}

export const AdminTagsService = {
  list() {
    return http.get<AdminTag[]>('/tags/').then((r) => ({ data: r.data }))
  },
  create(data: { name: string }) {
    return http.post<AdminTag>('/admin/tags', data).then((r) => r.data)
  },
  update(tagId: number, data: { name: string }) {
    return http.put<AdminTag>(`/admin/tags/${tagId}`, data).then((r) => r.data)
  },
  remove(tagId: number) {
    return http.delete<void>(`/admin/tags/${tagId}`).then((r) => r.data)
  },
}


