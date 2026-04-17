"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthProvider } from "@/lib/auth-context"
import { PatientProvider } from "@/lib/patient-context"
import { ConfigurationProvider } from "@/lib/configuration-context"

const PUBLIC_ROUTES = ["/login", "/register"]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route)
}

export function AppShellProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const publicRoute = isPublicRoute(pathname)

  return (
    <AuthProvider>
      {publicRoute ? (
        children
      ) : (
        <ProtectedRoute>
          <PatientProvider>
            <ConfigurationProvider>{children}</ConfigurationProvider>
          </PatientProvider>
        </ProtectedRoute>
      )}
    </AuthProvider>
  )
}
