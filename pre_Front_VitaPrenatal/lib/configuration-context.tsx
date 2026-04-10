"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  ConfiguracionesClinicas,
  FrecuenciaSeguimientoDias,
  NotificacionClinica,
  TipoNotificacion,
} from "@/interfaz/configuracion"
import { getConfiguraciones, updateConfiguraciones } from "@/servicios/configuracionService"
import { notificacionService } from "@/servicios/notificacionService"

export const defaultConfiguraciones: ConfiguracionesClinicas = {
  umbralSistolico: 140,
  umbralDiastolico: 90,
  frecuenciaSeguimiento: 14,
  notificacionesActivas: true,
  criticas: true,
  advertencias: true,
  informativas: true,
}

interface ConfigurationContextType {
  configuraciones: ConfiguracionesClinicas
  notifications: NotificacionClinica[]
  loadingConfiguraciones: boolean
  fetchNotificaciones: () => Promise<void>
  guardarConfiguraciones: (partial: Partial<ConfiguracionesClinicas>) => void
  setUmbrales: (sistolica: number, diastolica: number) => void
  setFrecuenciaSeguimiento: (dias: FrecuenciaSeguimientoDias) => void
  setNotificacionesActivas: (activas: boolean) => void
  setCanalesNotificacion: (
    canales: Partial<Pick<ConfiguracionesClinicas, "criticas" | "advertencias" | "informativas">>,
  ) => void
  marcarTodasLeidas: () => Promise<void>
  marcarNotificacionLeida: (id: number) => Promise<void>
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined)

function mapTipoNotificacion(value: unknown): TipoNotificacion {
  const normalized = String(value ?? "informativa").toLowerCase().trim()

  if (normalized === "critica" || normalized === "crítica" || normalized === "critical") {
    return "critica"
  }

  if (normalized === "advertencia" || normalized === "warning") {
    return "advertencia"
  }

  return "informativa"
}

const notificationDateFormatter = new Intl.DateTimeFormat("es-MX", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

function firstNonEmptyString(values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return null
}

function extractPacienteNombre(item: Record<string, unknown>): string {
  const directName = firstNonEmptyString([
    item.paciente,
    item.patient,
    item.paciente_nombre,
    item.nombre_paciente,
    item.patient_name,
    item.pacienteNombre,
    item.patientName,
    item.nombrePaciente,
  ])

  if (directName) {
    return directName
  }

  const nestedPatient = item.paciente ?? item.patient

  if (nestedPatient && typeof nestedPatient === "object") {
    const nested = nestedPatient as Record<string, unknown>
    const nestedName = firstNonEmptyString([
      nested.nombre,
      nested.name,
      nested.full_name,
      nested.fullName,
    ])

    if (nestedName) {
      return nestedName
    }
  }

  const pacienteId = Number(
    item.paciente_id ?? item.pacienteId ?? item.patient_id ?? item.patientId,
  )

  if (Number.isFinite(pacienteId) && pacienteId > 0) {
    return `Paciente #${pacienteId}`
  }

  return "Paciente no especificado"
}

function formatFechaNotificacion(value: unknown): string {
  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) {
      return notificationDateFormatter.format(value)
    }
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value)

    if (!Number.isNaN(parsed.getTime())) {
      return notificationDateFormatter.format(parsed)
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return notificationDateFormatter.format(new Date())
}

function normalizeNotificaciones(payload: unknown): NotificacionClinica[] {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map((rawItem, index) => {
    const item = (rawItem ?? {}) as Record<string, unknown>
    const normalizedId = Number(item.id ?? index + 1)

    return {
      id: Number.isFinite(normalizedId) && normalizedId > 0 ? normalizedId : index + 1,
      tipo: mapTipoNotificacion(item.tipo ?? item.type ?? item.nivel),
      mensaje: String(
        item.mensaje ??
          item.titulo ??
          item.title ??
          item.descripcion ??
          item.description ??
          "Notificación clínica",
      ),
      paciente: extractPacienteNombre(item),
      fecha: formatFechaNotificacion(
        item.fecha ?? item.date ?? item.created_at ?? item.createdAt ?? item.timestamp,
      ),
      leida: Boolean(item.leida ?? item.read ?? item.leido ?? item.is_read ?? item.isRead ?? false),
    }
  })
}

export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionesClinicas>(
    defaultConfiguraciones,
  )
  const [notifications, setNotifications] = useState<NotificacionClinica[]>([])
  const [loadingConfiguraciones, setLoadingConfiguraciones] = useState(true)

  const fetchNotificaciones = useCallback(async () => {
    try {
      const data = await notificacionService.getNotificaciones()
      setNotifications(normalizeNotificaciones(data))
    } catch (error) {
      console.warn("No se pudieron actualizar las notificaciones desde backend", error)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadConfiguraciones = async () => {
      const storedConfig = await getConfiguraciones()

      if (isMounted && storedConfig) {
        setConfiguraciones({ ...defaultConfiguraciones, ...storedConfig })
      }

      if (isMounted) {
        setLoadingConfiguraciones(false)
      }
    }

    loadConfiguraciones()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    void fetchNotificaciones()
  }, [fetchNotificaciones])

  const guardarConfiguraciones = (partial: Partial<ConfiguracionesClinicas>) => {
    setConfiguraciones((prev) => {
      const next = { ...prev, ...partial }
      void updateConfiguraciones(next)
      return next
    })
  }

  const setUmbrales = (sistolica: number, diastolica: number) => {
    guardarConfiguraciones({
      umbralSistolico: sistolica,
      umbralDiastolico: diastolica,
    })
  }

  const setFrecuenciaSeguimiento = (dias: FrecuenciaSeguimientoDias) => {
    guardarConfiguraciones({ frecuenciaSeguimiento: dias })
  }

  const setNotificacionesActivas = (activas: boolean) => {
    guardarConfiguraciones({ notificacionesActivas: activas })
  }

  const setCanalesNotificacion = (
    canales: Partial<
      Pick<ConfiguracionesClinicas, "criticas" | "advertencias" | "informativas">
    >,
  ) => {
    guardarConfiguraciones(canales)
  }

  const marcarTodasLeidas = async () => {
    const idsPendientes = notifications.filter((item) => !item.leida).map((item) => item.id)

    if (idsPendientes.length === 0) {
      return
    }

    setNotifications((prev) => prev.map((item) => ({ ...item, leida: true })))

    try {
      await Promise.all(idsPendientes.map((id) => notificacionService.marcarComoLeida(id)))
    } catch (error) {
      console.warn("No se pudieron marcar todas las notificaciones como leídas", error)
      await fetchNotificaciones()
    }
  }

  const marcarNotificacionLeida = async (id: number) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, leida: true } : item)),
    )

    try {
      await notificacionService.marcarComoLeida(id)
    } catch (error) {
      console.warn("No se pudo marcar la notificación como leída", error)
      await fetchNotificaciones()
    }
  }

  const value = useMemo(
    () => ({
      configuraciones,
      notifications,
      loadingConfiguraciones,
      fetchNotificaciones,
      guardarConfiguraciones,
      setUmbrales,
      setFrecuenciaSeguimiento,
      setNotificacionesActivas,
      setCanalesNotificacion,
      marcarTodasLeidas,
      marcarNotificacionLeida,
    }),
    [configuraciones, notifications, loadingConfiguraciones, fetchNotificaciones],
  )

  return <ConfigurationContext.Provider value={value}>{children}</ConfigurationContext.Provider>
}

export function useConfiguration() {
  const context = useContext(ConfigurationContext)

  if (context === undefined) {
    throw new Error("useConfiguration must be used within a ConfigurationProvider")
  }

  return context
}