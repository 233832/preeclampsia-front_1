"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Heart,
  LayoutDashboard,
  Users,
  Bell,
  Settings,
  RefreshCw,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useConfiguration } from "@/lib/configuration-context"
import { isNotificationEnabled } from "@/lib/notifications-data"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Monitoreo Clínico",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Pacientes",
    href: "/pacientes",
    icon: Users,
  },
]

interface MainNavProps {
  showRefresh?: boolean
  onRefresh?: () => void
  lastUpdated?: string
  hideUtilityActions?: boolean
  subHeader?: ReactNode
}

export function MainNav({
  showRefresh = false,
  onRefresh,
  lastUpdated,
  hideUtilityActions = false,
  subHeader,
}: MainNavProps) {
  const pathname = usePathname()
  const { configuraciones, notifications } = useConfiguration()

  const unreadCount = notifications.filter(
    (item) => !item.leida && isNotificationEnabled(item, configuraciones),
  ).length

  const notificationsActive = pathname === "/notificaciones"
  const settingsActive = pathname === "/configuraciones"

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 flex-shrink-0">
              <Heart className="h-5 w-5 text-primary" fill="currentColor" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                VitaPrenatal
              </h1>
              <p className="text-xs text-muted-foreground">
                Sistema de predicción temprana de riesgo de preeclampsia basado en ML
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          {!hideUtilityActions && (
            <div className="flex items-center gap-1 sm:gap-2">
              {showRefresh && onRefresh && (
                <>
                  {lastUpdated && (
                    <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Actualizado: {lastUpdated}</span>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Actualizar</span>
                  </Button>
                </>
              )}

              <Button
                asChild
                variant={notificationsActive ? "secondary" : "ghost"}
                size="icon"
                className={cn(
                  "relative",
                  notificationsActive && "bg-primary/10 text-primary hover:bg-primary/15",
                )}
              >
                <Link href="/notificaciones" aria-label="Ver notificaciones">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-card">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                </Link>
              </Button>

              <Button
                asChild
                variant={settingsActive ? "secondary" : "ghost"}
                size="icon"
                className={cn(
                  settingsActive && "bg-primary/10 text-primary hover:bg-primary/15",
                )}
              >
                <Link href="/configuraciones" aria-label="Abrir configuraciones">
                    <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {subHeader && (
          <div className="mt-3 border-t border-border/40 pt-3">{subHeader}</div>
        )}
      </div>
    </header>
  )
}
