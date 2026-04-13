"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Bell } from "lucide-react"
import { MainNav } from "@/components/navigation/main-nav"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useConfiguration } from "@/lib/configuration-context"
import { notificacionService } from "@/servicios/notificacionService"
import { formatDateTimeInMexico, getMexicoDateTimeSortValue } from "@/lib/mexico-time"

interface Notificacion {
  id: number
  mensaje: string
  tipo: "CRITICA" | "ADVERTENCIA" | "INFORMATIVA"
  paciente_nombre: string
  fecha: string
  estado: string
  leida: boolean
}

const TIPO_ORDEN: Array<Notificacion["tipo"]> = ["CRITICA", "ADVERTENCIA", "INFORMATIVA"]

function normalizeTipo(tipo: string): "CRITICA" | "ADVERTENCIA" | "INFORMATIVA" {
  const value = tipo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()

  if (value === "CRITICA") {
    return "CRITICA"
  }

  if (value === "ADVERTENCIA") {
    return "ADVERTENCIA"
  }

  return "INFORMATIVA"
}

function isLeida(estado: unknown, leida: unknown): boolean {
  if (typeof leida === "boolean") {
    return leida
  }

  const estadoTexto = String(estado ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()

  return estadoTexto === "LEIDA" || estadoTexto === "READ" || estadoTexto === "LEIDO"
}

function formatFecha(fecha: string): string {
  return formatDateTimeInMexico(fecha, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }, fecha)
}

function parseNotificacion(raw: unknown, fallbackIndex: number): Notificacion {
  const item = (raw ?? {}) as Record<string, unknown>
  const parsedId = Number(item.id ?? fallbackIndex + 1)
  const leida = isLeida(item.estado, item.leida)

  return {
    id: Number.isFinite(parsedId) ? parsedId : fallbackIndex + 1,
    mensaje: String(item.mensaje ?? "Sin mensaje"),
    tipo: normalizeTipo(String(item.tipo ?? "INFORMATIVA")),
    paciente_nombre: String(
      item.paciente_nombre ?? item.paciente ?? item.pacienteNombre ?? "Paciente no especificado",
    ),
    fecha: String(item.fecha ?? ""),
    estado: String(item.estado ?? (leida ? "LEÍDA" : "NO LEÍDA")),
    leida,
  }
}

function getStylesByType(tipo: Notificacion["tipo"]) {
  if (tipo === "CRITICA") {
    return {
      sectionTitle: "Alertas críticas",
      badgeClass: "border-red-600 bg-red-600 text-white",
      borderClass: "border-l-red-500",
      backgroundClass: "bg-red-50/60",
      markerClass: "bg-red-500",
    }
  }

  if (tipo === "ADVERTENCIA") {
    return {
      sectionTitle: "Advertencias",
      badgeClass: "border-amber-500 bg-amber-500 text-amber-950",
      borderClass: "border-l-amber-500",
      backgroundClass: "bg-amber-50/60",
      markerClass: "bg-amber-500",
    }
  }

  return {
    sectionTitle: "Informativas",
    badgeClass: "border-blue-600 bg-blue-600 text-white",
    borderClass: "border-l-blue-500",
    backgroundClass: "bg-blue-50/60",
    markerClass: "bg-blue-500",
  }
}

function getFechaTimestamp(fecha: string): number {
  return getMexicoDateTimeSortValue(fecha)
}

interface NotificationCardProps {
  mensaje: string
  paciente_nombre: string
  tipo: Notificacion["tipo"]
  fecha: string
  leida: boolean
  updating: boolean
  onLeida: () => void
}

function NotificationCard({
  mensaje,
  paciente_nombre,
  tipo,
  fecha,
  leida,
  updating,
  onLeida,
}: NotificationCardProps) {
  const tipoStyles = getStylesByType(tipo)
  const canMarkAsRead = !leida && !updating

  const handleCardClick = () => {
    if (!canMarkAsRead) {
      return
    }

    onLeida()
  }

  return (
    <Card
      onClick={handleCardClick}
      role={canMarkAsRead ? "button" : undefined}
      tabIndex={canMarkAsRead ? 0 : undefined}
      onKeyDown={(event) => {
        if (!canMarkAsRead) {
          return
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onLeida()
        }
      }}
      className={cn(
        "rounded-lg border border-border/70 border-l-8 shadow-sm",
        canMarkAsRead && "cursor-pointer",
        leida
          ? "border-l-border bg-muted/15 opacity-50"
          : cn(tipoStyles.borderClass, tipoStyles.backgroundClass),
      )}
    >
      <CardContent className="px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className={cn(
                "h-8 w-1.5 shrink-0 rounded-full",
                leida ? "bg-muted-foreground/40" : tipoStyles.markerClass,
              )}
            />

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <Badge
                  className={cn(
                    "shrink-0 rounded-md border px-2 py-0 text-[10px] font-semibold uppercase tracking-wide",
                    leida ? "border-border bg-muted text-muted-foreground" : tipoStyles.badgeClass,
                  )}
                >
                  {tipo}
                </Badge>

                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    leida ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {mensaje}
                </p>
              </div>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {paciente_nombre} · {formatFecha(fecha)}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation()
              onLeida()
            }}
            disabled={leida || updating}
            className={cn(
              "h-8 shrink-0 rounded-md px-3 text-xs",
              leida && "cursor-not-allowed border-border bg-muted text-muted-foreground",
            )}
          >
            {updating ? "Actualizando..." : "Marcar como leída"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface NotificacionCardContainerProps {
  notificacion: Notificacion
  updatingId: number | null
  onLeida: (id: number) => Promise<void>
}

function NotificacionCardContainer({
  notificacion,
  updatingId,
  onLeida,
}: NotificacionCardContainerProps) {
  return (
    <NotificationCard
      mensaje={notificacion.mensaje}
      paciente_nombre={notificacion.paciente_nombre}
      tipo={notificacion.tipo}
      fecha={notificacion.fecha}
      leida={notificacion.leida}
      updating={updatingId === notificacion.id}
      onLeida={() => {
        void onLeida(notificacion.id)
      }}
    />
  )
}

export default function NotificacionesPage() {
  const { fetchNotificaciones } = useConfiguration()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const cargarNotificaciones = useCallback(async () => {
    setError("")

    try {
      const payload = await notificacionService.getNotificaciones()
      const normalized = Array.isArray(payload)
        ? payload.map((item, index) => parseNotificacion(item, index))
        : []

      normalized.sort((a, b) => {
        return getFechaTimestamp(b.fecha) - getFechaTimestamp(a.fecha)
      })

      setNotificaciones(normalized)
    } catch (fetchError) {
      console.error("No se pudo obtener notificaciones", fetchError)
      setError("No se pudieron cargar las notificaciones. Intente nuevamente.")
      setNotificaciones([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargarNotificaciones()
  }, [cargarNotificaciones])

  const marcarComoLeida = async (id: number) => {
    setUpdatingId(id)
    setError("")

    try {
      await notificacionService.marcarComoLeida(id)
    } catch (markError) {
      console.error("No se pudo marcar la notificación como leída", markError)
      setError("No fue posible marcar la notificación como leída.")
    } finally {
      await Promise.all([cargarNotificaciones(), fetchNotificaciones()])
      setUpdatingId(null)
    }
  }

  const unreadCount = useMemo(
    () => notificaciones.filter((notificacion) => !notificacion.leida).length,
    [notificaciones],
  )

  const groupedNotificaciones = useMemo(
    () =>
      TIPO_ORDEN.map((tipo) => {
        const tipoStyles = getStylesByType(tipo)

        return {
          tipo,
          sectionTitle: tipoStyles.sectionTitle,
          items: notificaciones
            .filter((notificacion) => notificacion.tipo === tipo)
            .sort((a, b) => getFechaTimestamp(b.fecha) - getFechaTimestamp(a.fecha)),
        }
      }).filter((section) => section.items.length > 0),
    [notificaciones],
  )

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Bell className="h-6 w-6 text-primary" />
              Notificaciones Clínicas
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Alertas del sistema con contexto clínico para seguimiento oportuno.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm text-muted-foreground">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            No leídas: {unreadCount}
          </div>
        </div>

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="py-3 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        {loading ? (
          <Card className="border-border/70 shadow-sm">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Cargando notificaciones...
            </CardContent>
          </Card>
        ) : notificaciones.length === 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-base font-medium text-foreground">Sin notificaciones</p>
              <p className="mt-2 text-sm text-muted-foreground">
                No hay eventos disponibles para mostrar en este momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {groupedNotificaciones.map((section) => (
              <section key={section.tipo} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {section.sectionTitle}
                  </h3>
                  <span className="text-xs text-muted-foreground">{section.items.length}</span>
                </div>

                <div className="space-y-2">
                  {section.items.map((notificacion) => (
                    <NotificacionCardContainer
                      key={notificacion.id}
                      notificacion={notificacion}
                      updatingId={updatingId}
                      onLeida={marcarComoLeida}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}