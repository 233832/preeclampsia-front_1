"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Bell, CircleAlert, Info, TriangleAlert } from "lucide-react"
import { MainNav } from "@/components/navigation/main-nav"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notificacion {
  id: number
  mensaje: string
  tipo: string
  paciente_nombre: string
  fecha: string
  estado: string
  leida: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

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

function estadoLegible(notificacion: Notificacion): string {
  return notificacion.leida ? "LEÍDA" : "NO LEÍDA"
}

function formatFecha(fecha: string): string {
  const parsed = new Date(fecha)

  if (Number.isNaN(parsed.getTime())) {
    return fecha
  }

  return new Date(fecha).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  })
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

function getTipoStyles(tipo: Notificacion["tipo"]) {
  if (tipo === "CRITICA") {
    return {
      icon: TriangleAlert,
      badgeClass: "border-red-200 bg-red-100 text-red-700",
    }
  }

  if (tipo === "ADVERTENCIA") {
    return {
      icon: CircleAlert,
      badgeClass: "border-amber-200 bg-amber-100 text-amber-700",
    }
  }

  return {
    icon: Info,
    badgeClass: "border-blue-200 bg-blue-100 text-blue-700",
  }
}

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const cargarNotificaciones = useCallback(async () => {
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/notificaciones/`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const payload = await response.json()
      const normalized = Array.isArray(payload)
        ? payload.map((item, index) => parseNotificacion(item, index))
        : []

      normalized.sort((a, b) => {
        const first = new Date(a.fecha).getTime()
        const second = new Date(b.fecha).getTime()

        return second - first
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
      const response = await fetch(`${API_BASE_URL}/notificaciones/${id}/leida`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      await cargarNotificaciones()
    } catch (markError) {
      console.error("No se pudo marcar la notificación como leída", markError)
      setError("No fue posible marcar la notificación como leída.")
    } finally {
      setUpdatingId(null)
    }
  }

  const unreadCount = useMemo(
    () => notificaciones.filter((notificacion) => !notificacion.leida).length,
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
          <div className="space-y-4">
            {notificaciones.map((notificacion) => {
              const tipoStyles = getTipoStyles(notificacion.tipo)
              const TipoIcon = tipoStyles.icon

              return (
                <Card key={notificacion.id} className="border-border/70 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {!notificacion.leida && (
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                        )}
                        <CardTitle className="text-base font-semibold text-foreground">
                          {notificacion.mensaje}
                        </CardTitle>
                      </div>
                      <Badge className={cn("gap-1 border", tipoStyles.badgeClass)}>
                        <TipoIcon className="h-3.5 w-3.5" />
                        {notificacion.tipo}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <p>
                        <span className="font-medium text-foreground">Paciente: </span>
                        <span className="text-muted-foreground">{notificacion.paciente_nombre}</span>
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Fecha: </span>
                        <span className="text-muted-foreground">{formatFecha(notificacion.fecha)}</span>
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Estado: </span>
                        <span className="text-muted-foreground">{estadoLegible(notificacion)}</span>
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => void marcarComoLeida(notificacion.id)}
                        disabled={notificacion.leida || updatingId === notificacion.id}
                      >
                        {updatingId === notificacion.id ? "Actualizando..." : "Marcar como leída"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}