import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.token) {
          setUser(parsed.user ?? { id: parsed.userId ?? "unknown" })
          setRole(parsed.role ?? null)
        }
      }
    } catch (_) {}
    setIsInitialized(true)
  }, [])

  const login = (payload) => {
    // payload: { token, role, user }
    localStorage.setItem("auth", JSON.stringify(payload))
    setUser(payload.user ?? null)
    setRole(payload.role ?? null)
  }

  const logout = () => {
    localStorage.removeItem("auth")
    setUser(null)
    setRole(null)
  }

  const value = useMemo(
    () => ({
      isInitialized,
      user,
      role,
      isAuthenticated: Boolean(user) && Boolean(role),
      login,
      logout,
    }),
    [isInitialized, user, role]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
