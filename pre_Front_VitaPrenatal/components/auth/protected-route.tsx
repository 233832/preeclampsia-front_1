"use client"

import { ReactNode, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const PUBLIC_ROUTES = ["/login", "/register"]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route)
}

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, initializing } = useAuth()

  useEffect(() => {
    if (!initializing && !isAuthenticated && !isPublicRoute(pathname)) {
      router.replace("/login")
    }
  }, [isAuthenticated, initializing, pathname, router])

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff7fc]">
        <div className="rounded-2xl border border-[#e7d8ef] bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-[#7f6b8f]">Validando sesion...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    return null
  }

  return <>{children}</>
}
