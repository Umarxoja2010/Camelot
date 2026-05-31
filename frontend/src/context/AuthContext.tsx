import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api, tokenStorage } from '@/lib/api'
import type { Role, User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  role: Role | null
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = tokenStorage.get()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get<{ data: User }>('/me')
      .then((res) => setUser(res.data.data))
      .catch(() => {
        tokenStorage.clear()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: User; token: string }>('/login', { email, password })
    tokenStorage.set(res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch {
      // token allaqachon yaroqsiz bo'lishi mumkin
    }
    tokenStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        role: user?.role ?? null,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak')
  return ctx
}
