import { defineStore } from 'pinia'
import { getSession, logout as logoutApi } from '@/services/auth-fake'

export type AuthUser = { id: string; name: string; email: string }

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as AuthUser | null, token: '' }),
  actions: {
    load() {
      const s = getSession()
      if (s) {
        this.user = s.user
        this.token = s.token
      }
    },
    setSession(token: string, user: AuthUser) {
      this.token = token
      this.user = user
    },
    logout() {
      logoutApi()
      this.token = ''
      this.user = null
    },
  },
})
