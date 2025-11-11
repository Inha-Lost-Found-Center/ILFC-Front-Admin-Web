export type ItemStatus = '보관' | '예약' | '찾음'

export type Tag = {
  id: number
  name: string
}

export type Item = {
  id: number
  photo_url: string
  location: string
  status: ItemStatus
  registered_at: string
  tags: Tag[]
}

