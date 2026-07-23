import type { AuthSessionResponse, AuthUserDto } from '@skm/specs'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'skm-auth'

type StoredAuth = {
  accessToken: string
  refreshToken: string
  user: AuthUserDto | null
}

function readStorage(): StoredAuth | null {
  if (!import.meta.client) {
    return null
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as StoredAuth
  }
  catch {
    return null
  }
}

function writeStorage(payload: StoredAuth | null) {
  if (!import.meta.client) {
    return
  }
  if (!payload) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
    user: null as AuthUserDto | null,
    hydrated: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken && state.user),
    permissions: (state) => state.user?.permissions ?? [],
  },
  actions: {
    hydrate() {
      const stored = readStorage()
      if (stored) {
        this.accessToken = stored.accessToken
        this.refreshToken = stored.refreshToken
        this.user = stored.user
      }
      this.hydrated = true
    },
    setSession(session: AuthSessionResponse) {
      this.accessToken = session.accessToken
      this.refreshToken = session.refreshToken
      this.user = session.user
      writeStorage({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
      })
    },
    setUser(user: AuthUserDto) {
      this.user = user
      if (this.accessToken && this.refreshToken) {
        writeStorage({
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          user,
        })
      }
    },
    clearSession() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      writeStorage(null)
    },
    async login(email: string, password: string) {
      const { api } = useApi()
      const session = await api<AuthSessionResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      })
      this.setSession(session)
      return session
    },
    async register(name: string, email: string, password: string) {
      const { api } = useApi()
      const session = await api<AuthSessionResponse>('/auth/register', {
        method: 'POST',
        body: { name, email, password },
        auth: false,
      })
      this.setSession(session)
      return session
    },
    async fetchMe() {
      if (!this.accessToken) {
        return null
      }
      const { api } = useApi()
      const user = await api<AuthUserDto>('/auth/me')
      this.setUser(user)
      return user
    },
    async refresh() {
      if (!this.refreshToken) {
        this.clearSession()
        throw new Error('No refresh token')
      }
      const { api } = useApi()
      const session = await api<AuthSessionResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: this.refreshToken },
        auth: false,
      })
      this.setSession(session)
      return session
    },
    async logout() {
      const refreshToken = this.refreshToken
      try {
        if (this.accessToken) {
          const { api } = useApi()
          await api('/auth/logout', {
            method: 'POST',
            body: { refreshToken },
          })
        }
      }
      catch {
        // ignore logout network errors
      }
      finally {
        this.clearSession()
      }
    },
  },
})
