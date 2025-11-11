import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tokens } from '../types/auth'

type AuthState = {
  tokens: Tokens | null
  setTokens: (tokens: Tokens | null) => void
  isAuthed: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      setTokens: (tokens) => set({ tokens }),
      isAuthed: () => Boolean(get().tokens?.access_token),
    }),
    { name: 'ilfc-auth' }
  )
)


