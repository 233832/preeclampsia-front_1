"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Heart, Bell, Settings, RefreshCw, Calendar, AlertTriangle, AlertCircle, Info } from "lucide-react"

interface DashboardHeaderProps {
  lastUpdated: string
  onRefresh?: () => void
}

const notificationsSample = [
  {
    id: "1",
    variant: "critical",
    title: "Nivel de riesgo alto detectado",
    patient: "María López",
    date: "Hoy, 08:34",
  },
  {
    id: "2",
    variant: "warning",
    title: "Presión arterial fuera de rango",
    patient: "Ana Pérez",
    date: "Hoy, 07:10",
  },
  {
    id: "3",
    variant: "info",
    title: "Consulta registrada correctamente",
    patient: "Laura Díaz",
    date: "Ayer, 17:45",
  },
]

const notificationStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-primary/10 text-primary",
}

const notificationIcons: Record<string, typeof AlertTriangle> = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
}

export function DashboardHeader({ lastUpdated, onRefresh }: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState(notificationsSample)
  const [readAll, setReadAll] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [appAlerts, setAppAlerts] = useState(true)

  const unreadCount = readAll ? 0 : notifications.length

  const markAllRead = () => {
    setReadAll(true)
  }

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 flex-shrink-0">
              <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                VitaPrenatal
              </h1>
              <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-md lg:max-w-lg">
                Sistema de predicción temprana de riesgo de preeclampsia basado en ML
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Actualizado: {lastUpdated}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[26rem] p-3">
                <div className="flex items-start justify-between gap-4 px-2 pb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Notificaciones</p>
                    <p className="text-xs text-muted-foreground">Alertas del monitoreo clínico</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllRead}
                    className="whitespace-nowrap"
                  >
                    Marcar todas como leídas
                  </Button>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((item) => {
                    const Icon = notificationIcons[item.variant]
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 ${notificationStyles[item.variant]}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.patient} · {item.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[28rem] p-4">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-foreground">Umbrales</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ajusta los límites clínicos que usarán las alertas y el monitoreo.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Notificaciones</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Activa o desactiva los alertas clínicos.
                        </p>
                      </div>
                      <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/80 p-3">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Alertas críticas</p>
                            <p className="text-xs text-muted-foreground">Avisos de riesgo alto inmediato.</p>
                          </div>
                        </div>
                        <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/80 p-3">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Advertencias</p>
                            <p className="text-xs text-muted-foreground">Señales de observación clínica.</p>
                          </div>
                        </div>
                        <Switch checked={appAlerts} onCheckedChange={setAppAlerts} />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/80 p-3">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary mt-1" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Informativas</p>
                            <p className="text-xs text-muted-foreground">Actualizaciones generales del sistema.</p>
                          </div>
                        </div>
                        <Switch checked={readAll} onCheckedChange={setReadAll} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-foreground">Frecuencia</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recibe alertas según tus horarios clínicos establecidos.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-foreground">Información</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Todas las configuraciones son parte del monitoreo clínico del paciente.
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
