"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { AuthContextValue } from "@/interfaz/auth"
import { registerUnauthorizedHandler, setAuthToken } from "@/lib/auth-token-store"
import { authService, AuthServiceError } from "@/servicios/authService"

const PUBLIC_ROUTES = ["/login", "/register"]

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setErrorMessage(null)
  }, [])

  const clearSession = useCallback(
    async (message?: string) => {
      setAuthToken(null)
      setIsAuthenticated(false)

      if (message) {
        setErrorMessage(message)
      }

      if (!isPublicRoute(pathname)) {
        router.replace("/login")
      }
    },
    [pathname, router],
  )

  useEffect(() => {
    const unregister = registerUnauthorizedHandler(() => {
      void clearSession("Sesion expirada o no autenticada")
    })

    return unregister
  }, [clearSession])

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      setInitializing(true)

      try {
        const hasActiveSession = await authService.validateSession()

        if (!isMounted) {
          return
        }

        setIsAuthenticated(hasActiveSession)
      } finally {
        if (isMounted) {
          setInitializing(false)
        }
      }
    }

    void restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setErrorMessage(null)

      try {
        const response = await authService.login({ email, password })
        setAuthToken(response.access_token)
        setIsAuthenticated(true)
        router.replace("/")
      } catch (error) {
        setAuthToken(null)
        setIsAuthenticated(false)

        if (error instanceof AuthServiceError) {
          setErrorMessage(error.message)
        } else {
          setErrorMessage("No se pudo conectar al servidor")
        }

        throw error
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  const register = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setErrorMessage(null)

      try {
        await authService.register({ email, password })
        const loginResponse = await authService.login({ email, password })
        setAuthToken(loginResponse.access_token)
        setIsAuthenticated(true)
        router.replace("/")
      } catch (error) {
        setAuthToken(null)
        setIsAuthenticated(false)

        if (error instanceof AuthServiceError) {
          setErrorMessage(error.message)
        } else {
          setErrorMessage("No se pudo conectar al servidor")
        }

        throw error
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  const logout = useCallback(async () => {
    setLoading(true)

    try {
      await authService.logout()
    } finally {
      await clearSession()
      setLoading(false)
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      initializing,
      loading,
      errorMessage,
      register,
      login,
      logout,
      clearError,
    }),
    [isAuthenticated, initializing, loading, errorMessage, register, login, logout, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
