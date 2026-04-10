"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useConfiguration } from "@/lib/configuration-context"
import { isNotificationEnabled } from "@/lib/notifications-data"
import { TipoNotificacion } from "@/interfaz/configuracion"
import { Bell, Settings, RefreshCw, Calendar, AlertTriangle, AlertCircle, Info } from "lucide-react"

interface DashboardHeaderProps {
  lastUpdated: string
  onRefresh?: () => void
}

const notificationStyles: Record<TipoNotificacion, string> = {
  critica: "bg-red-100 text-red-700",
  advertencia: "bg-amber-100 text-amber-700",
  informativa: "bg-primary/10 text-primary",
}

const notificationIcons: Record<TipoNotificacion, typeof AlertTriangle> = {
  critica: AlertTriangle,
  advertencia: AlertCircle,
  informativa: Info,
}

export function DashboardHeader({ lastUpdated, onRefresh }: DashboardHeaderProps) {
  const {
    configuraciones,
    notifications,
    marcarTodasLeidas,
    marcarNotificacionLeida,
    setNotificacionesActivas,
    setCanalesNotificacion,
  } = useConfiguration()

  const visibleNotifications = notifications.filter((item) =>
    isNotificationEnabled(item, configuraciones),
  )
  const unreadCount = visibleNotifications.filter((item) => !item.leida).length

  const markAllRead = async () => {
    await marcarTodasLeidas()
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">Panel de monitoreo clínico</p>
        <p className="text-xs text-muted-foreground">
          Acciones rápidas para actualización y gestión de alertas.
        </p>
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
          disabled={!onRefresh}
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
                disabled={unreadCount === 0}
                className="whitespace-nowrap"
              >
                Marcar todas como leídas
              </Button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {visibleNotifications.length === 0 ? (
                <div className="rounded-2xl border border-border/70 bg-card/80 p-3 text-center text-sm text-muted-foreground">
                  Sin notificaciones disponibles.
                </div>
              ) : (
                visibleNotifications.map((item) => {
                  const Icon = notificationIcons[item.tipo]

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void marcarNotificacionLeida(item.id)}
                      className="w-full rounded-2xl border border-border/70 bg-card/80 p-3 text-left shadow-sm transition-colors hover:bg-card"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 ${notificationStyles[item.tipo]}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{item.mensaje}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.paciente} · {item.fecha}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
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
                      Activa o desactiva las alertas clínicas.
                    </p>
                  </div>
                  <Switch
                    checked={configuraciones.notificacionesActivas}
                    onCheckedChange={setNotificacionesActivas}
                  />
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
                    <Switch
                      checked={configuraciones.criticas}
                      onCheckedChange={(checked) => setCanalesNotificacion({ criticas: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/80 p-3">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Advertencias</p>
                        <p className="text-xs text-muted-foreground">Señales de observación clínica.</p>
                      </div>
                    </div>
                    <Switch
                      checked={configuraciones.advertencias}
                      onCheckedChange={(checked) =>
                        setCanalesNotificacion({ advertencias: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/80 p-3">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Informativas</p>
                        <p className="text-xs text-muted-foreground">Actualizaciones generales del sistema.</p>
                      </div>
                    </div>
                    <Switch
                      checked={configuraciones.informativas}
                      onCheckedChange={(checked) =>
                        setCanalesNotificacion({ informativas: checked })
                      }
                    />
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
              <Button asChild variant="outline" className="w-full">
                <Link href="/configuraciones">Ir a Configuraciones</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
