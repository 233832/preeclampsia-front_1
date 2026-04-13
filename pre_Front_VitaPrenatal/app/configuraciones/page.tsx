"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { BellRing, CalendarClock, HeartPulse, Save, Settings2 } from "lucide-react"
import { MainNav } from "@/components/navigation/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"
import {
  getConfiguraciones,
  updateConfiguraciones,
  type ConfiguracionesPayload,
} from "@/services/configuracionService"

const UMBRAL_SISTOLICO_KEYS = ["umbral_sistolico", "umbralSistolico"] as const
const UMBRAL_DIASTOLICO_KEYS = ["umbral_diastolico", "umbralDiastolico"] as const
const NOTIFICACIONES_ACTIVAS_KEYS = ["notificaciones_activas", "notificacionesActivas"] as const
const CRITICAS_KEYS = ["criticas", "críticas"] as const
const ADVERTENCIAS_KEYS = ["advertencias"] as const
const INFORMATIVAS_KEYS = ["informativas"] as const

const SEGUIMIENTO_BAJO_KEYS = [
  "frecuencia_bajo",
  "seguimiento_riesgo_bajo_dias",
  "seguimiento_bajo_dias",
  "riesgo_bajo_dias",
  "dias_riesgo_bajo",
] as const

const SEGUIMIENTO_MEDIO_KEYS = [
  "frecuencia_medio",
  "seguimiento_riesgo_medio_dias",
  "seguimiento_medio_dias",
  "riesgo_medio_dias",
  "dias_riesgo_medio",
] as const

const SEGUIMIENTO_ALTO_KEYS = [
  "frecuencia_alto",
  "seguimiento_riesgo_alto_dias",
  "seguimiento_alto_dias",
  "riesgo_alto_dias",
  "dias_riesgo_alto",
] as const

const NOMBRE_SISTEMA_KEYS = ["nombre_sistema", "nombreSistema", "sistema_nombre", "nombre"] as const
const VERSION_SISTEMA_KEYS = ["version", "version_sistema", "versionSistema"] as const
const DESCRIPCION_SISTEMA_KEYS = [
  "descripcion",
  "descripcion_sistema",
  "descripcionSistema",
  "sistema_descripcion",
] as const

const DEFAULT_CONFIG_VALUES = {
  umbral_sistolico: 140,
  umbral_diastolico: 90,
  notificaciones_activas: true,
  seguimiento_riesgo_bajo_dias: 30,
  seguimiento_riesgo_medio_dias: 14,
  seguimiento_riesgo_alto_dias: 7,
  nombre_sistema: "VitaPrenatal",
  version_sistema: "1.0.0",
  descripcion_sistema: "Plataforma clínica para monitoreo y seguimiento prenatal.",
  criticas: true,
  advertencias: true,
  informativas: true,
} as const

const SYSTEM_LOGO_SRC = "/Gemini_Generated_Image_.png"

interface ConfiguracionFormState {
  umbral_sistolico: string
  umbral_diastolico: string
  criticas: boolean
  advertencias: boolean
  informativas: boolean
  seguimiento_riesgo_bajo_dias: string
  seguimiento_riesgo_medio_dias: string
  seguimiento_riesgo_alto_dias: string
  nombre_sistema: string
  version_sistema: string
  descripcion_sistema: string
}

interface FeedbackState {
  type: "success" | "error"
  message: string
}

const DEFAULT_FORM_STATE: ConfiguracionFormState = {
  umbral_sistolico: String(DEFAULT_CONFIG_VALUES.umbral_sistolico),
  umbral_diastolico: String(DEFAULT_CONFIG_VALUES.umbral_diastolico),
  criticas: DEFAULT_CONFIG_VALUES.criticas,
  advertencias: DEFAULT_CONFIG_VALUES.advertencias,
  informativas: DEFAULT_CONFIG_VALUES.informativas,
  seguimiento_riesgo_bajo_dias: String(DEFAULT_CONFIG_VALUES.seguimiento_riesgo_bajo_dias),
  seguimiento_riesgo_medio_dias: String(DEFAULT_CONFIG_VALUES.seguimiento_riesgo_medio_dias),
  seguimiento_riesgo_alto_dias: String(DEFAULT_CONFIG_VALUES.seguimiento_riesgo_alto_dias),
  nombre_sistema: DEFAULT_CONFIG_VALUES.nombre_sistema,
  version_sistema: DEFAULT_CONFIG_VALUES.version_sistema,
  descripcion_sistema: DEFAULT_CONFIG_VALUES.descripcion_sistema,
}

function hasKey(source: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(source, key)
}

function readNumberValue(
  source: Record<string, unknown>,
  aliases: readonly string[],
  fallback: number,
): number {
  for (const key of aliases) {
    if (!hasKey(source, key)) {
      continue
    }

    const raw = source[key]
    const parsed =
      typeof raw === "number"
        ? raw
        : typeof raw === "string" && raw.trim()
          ? Number(raw)
          : Number.NaN

    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed
    }
  }

  return fallback
}

function readBooleanValue(
  source: Record<string, unknown>,
  aliases: readonly string[],
  fallback: boolean,
): boolean {
  for (const key of aliases) {
    if (!hasKey(source, key)) {
      continue
    }

    const raw = source[key]

    if (typeof raw === "boolean") {
      return raw
    }

    if (typeof raw === "string") {
      const normalized = raw.trim().toLowerCase()

      if (normalized === "true") {
        return true
      }

      if (normalized === "false") {
        return false
      }
    }
  }

  return fallback
}

function readTextValue(
  source: Record<string, unknown>,
  aliases: readonly string[],
  fallback: string,
): string {
  for (const key of aliases) {
    if (!hasKey(source, key)) {
      continue
    }

    const raw = source[key]

    if (typeof raw === "string") {
      const trimmed = raw.trim()
      if (trimmed) {
        return trimmed
      }
    }
  }

  return fallback
}

function setValueForAliases(
  target: Record<string, unknown>,
  aliases: readonly string[],
  value: string | number | boolean,
) {
  const existingKeys = aliases.filter((key) => hasKey(target, key))

  if (existingKeys.length > 0) {
    for (const key of existingKeys) {
      target[key] = value
    }

    return
  }

  target[aliases[0]] = value
}

function toFormState(data: ConfiguracionesPayload): ConfiguracionFormState {
  const source = data as Record<string, unknown>

  return {
    umbral_sistolico: String(
      readNumberValue(source, UMBRAL_SISTOLICO_KEYS, DEFAULT_CONFIG_VALUES.umbral_sistolico),
    ),
    umbral_diastolico: String(
      readNumberValue(source, UMBRAL_DIASTOLICO_KEYS, DEFAULT_CONFIG_VALUES.umbral_diastolico),
    ),
    criticas: readBooleanValue(source, CRITICAS_KEYS, DEFAULT_CONFIG_VALUES.criticas),
    advertencias: readBooleanValue(source, ADVERTENCIAS_KEYS, DEFAULT_CONFIG_VALUES.advertencias),
    informativas: readBooleanValue(source, INFORMATIVAS_KEYS, DEFAULT_CONFIG_VALUES.informativas),
    seguimiento_riesgo_bajo_dias: String(
      readNumberValue(
        source,
        SEGUIMIENTO_BAJO_KEYS,
        DEFAULT_CONFIG_VALUES.seguimiento_riesgo_bajo_dias,
      ),
    ),
    seguimiento_riesgo_medio_dias: String(
      readNumberValue(
        source,
        SEGUIMIENTO_MEDIO_KEYS,
        DEFAULT_CONFIG_VALUES.seguimiento_riesgo_medio_dias,
      ),
    ),
    seguimiento_riesgo_alto_dias: String(
      readNumberValue(
        source,
        SEGUIMIENTO_ALTO_KEYS,
        DEFAULT_CONFIG_VALUES.seguimiento_riesgo_alto_dias,
      ),
    ),
    nombre_sistema: readTextValue(
      source,
      NOMBRE_SISTEMA_KEYS,
      DEFAULT_CONFIG_VALUES.nombre_sistema,
    ),
    version_sistema: readTextValue(
      source,
      VERSION_SISTEMA_KEYS,
      DEFAULT_CONFIG_VALUES.version_sistema,
    ),
    descripcion_sistema: readTextValue(
      source,
      DESCRIPCION_SISTEMA_KEYS,
      DEFAULT_CONFIG_VALUES.descripcion_sistema,
    ),
  }
}

export default function ConfiguracionesPage() {
  const [formState, setFormState] = useState<ConfiguracionFormState>(DEFAULT_FORM_STATE)
  const [baseConfig, setBaseConfig] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadConfiguraciones = async () => {
      setLoading(true)
      setFeedback(null)

      try {
        const data = await getConfiguraciones()

        if (isMounted) {
          setBaseConfig(data)
          setFormState(toFormState(data))
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido al cargar configuración"

        console.warn("No se pudieron cargar configuraciones:", errorMessage)

        if (isMounted) {
          setFeedback({
            type: "error",
            message:
              errorMessage.includes("No se pudo conectar al backend") ||
              errorMessage.includes("Failed to fetch")
                ? "No hay conexión con el backend para cargar configuraciones."
                : "No se pudieron cargar las configuraciones.",
          })
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadConfiguraciones()

    return () => {
      isMounted = false
    }
  }, [])

  const parseNonNegativeNumber = (value: string, label: string): number | null => {
    const parsed = Number(value)

    if (!Number.isFinite(parsed) || parsed < 0) {
      setFeedback({
        type: "error",
        message: `${label} debe ser un número mayor o igual a 0.`,
      })
      return null
    }

    return parsed
  }

  const guardarCambios = async () => {
    const sistolica = parseNonNegativeNumber(formState.umbral_sistolico, "Presión sistólica")
    if (sistolica === null) {
      return
    }

    const diastolica = parseNonNegativeNumber(formState.umbral_diastolico, "Presión diastólica")
    if (diastolica === null) {
      return
    }

    const seguimientoBajo = parseNonNegativeNumber(
      formState.seguimiento_riesgo_bajo_dias,
      "Seguimiento de riesgo bajo",
    )
    if (seguimientoBajo === null) {
      return
    }

    const seguimientoMedio = parseNonNegativeNumber(
      formState.seguimiento_riesgo_medio_dias,
      "Seguimiento de riesgo medio",
    )
    if (seguimientoMedio === null) {
      return
    }

    const seguimientoAlto = parseNonNegativeNumber(
      formState.seguimiento_riesgo_alto_dias,
      "Seguimiento de riesgo alto",
    )
    if (seguimientoAlto === null) {
      return
    }

    const sourceConfig = baseConfig as Record<string, unknown>
    const nombreSistema = readTextValue(
      sourceConfig,
      NOMBRE_SISTEMA_KEYS,
      DEFAULT_CONFIG_VALUES.nombre_sistema,
    )
    const versionSistema = readTextValue(
      sourceConfig,
      VERSION_SISTEMA_KEYS,
      DEFAULT_CONFIG_VALUES.version_sistema,
    )
    const descripcionSistema = readTextValue(
      sourceConfig,
      DESCRIPCION_SISTEMA_KEYS,
      DEFAULT_CONFIG_VALUES.descripcion_sistema,
    )

    setSaving(true)
    setFeedback(null)

    try {
      const payload = { ...baseConfig }
      setValueForAliases(payload, UMBRAL_SISTOLICO_KEYS, sistolica)
      setValueForAliases(payload, UMBRAL_DIASTOLICO_KEYS, diastolica)
      setValueForAliases(
        payload,
        NOTIFICACIONES_ACTIVAS_KEYS,
        formState.criticas || formState.advertencias || formState.informativas,
      )
      setValueForAliases(payload, CRITICAS_KEYS, formState.criticas)
      setValueForAliases(payload, ADVERTENCIAS_KEYS, formState.advertencias)
      setValueForAliases(payload, INFORMATIVAS_KEYS, formState.informativas)
      setValueForAliases(payload, SEGUIMIENTO_BAJO_KEYS, seguimientoBajo)
      setValueForAliases(payload, SEGUIMIENTO_MEDIO_KEYS, seguimientoMedio)
      setValueForAliases(payload, SEGUIMIENTO_ALTO_KEYS, seguimientoAlto)
      setValueForAliases(payload, NOMBRE_SISTEMA_KEYS, nombreSistema)
      setValueForAliases(payload, VERSION_SISTEMA_KEYS, versionSistema)
      setValueForAliases(payload, DESCRIPCION_SISTEMA_KEYS, descripcionSistema)

      const updated = await updateConfiguraciones(payload as ConfiguracionesPayload)
      setBaseConfig(updated)
      setFormState(toFormState(updated))
      setFeedback({ type: "success", message: "Configuración guardada correctamente." })
      toast({
        title: "Configuración guardada correctamente",
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido al guardar configuración"

      console.warn("No se pudieron guardar configuraciones:", errorMessage)

      setFeedback({
        type: "error",
        message:
          errorMessage.includes("No se pudo conectar al backend") ||
          errorMessage.includes("Failed to fetch")
            ? "No hay conexión con el backend para guardar configuraciones."
            : "No fue posible guardar la configuración.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl border border-border/70 bg-gradient-to-b from-rose-50/55 via-background to-violet-50/45 px-6 py-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-3xl border border-rose-100/80 bg-white/90 p-2.5 shadow-[0_14px_28px_-22px_rgba(157,23,77,0.8)]">
                <Image
                  src={SYSTEM_LOGO_SRC}
                  alt="Logo del sistema VitaPrenatal"
                  width={220}
                  height={220}
                  className="h-32 w-32 rounded-2xl object-cover object-center sm:h-36 sm:w-36"
                  priority
                />
              </div>

              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                Configuraciones del Sistema
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Administra parámetros clínicos y operativos con una estructura clara, ordenada y
                enfocada en la legibilidad.
              </p>
            </div>
          </div>

          {loading ? (
            <Card className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Cargando configuraciones...
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="h-full rounded-xl border-border/70 shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <HeartPulse className="h-4 w-4 text-primary" />
                      1. Umbrales Clínicos
                    </CardTitle>
                    <CardDescription>Defina los límites de presión arterial del sistema.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="umbral-sistolico">Presión sistólica</Label>
                        <Input
                          id="umbral-sistolico"
                          className="h-9"
                          type="number"
                          min={0}
                          value={formState.umbral_sistolico}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              umbral_sistolico: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="umbral-diastolico">Presión diastólica</Label>
                        <Input
                          id="umbral-diastolico"
                          className="h-9"
                          type="number"
                          min={0}
                          value={formState.umbral_diastolico}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              umbral_diastolico: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-full rounded-xl border-border/70 shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BellRing className="h-4 w-4 text-primary" />
                      2. Notificaciones
                    </CardTitle>
                    <CardDescription>Seleccione qué alertas clínicas desea habilitar.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                      <Label htmlFor="switch-criticas" className="text-sm text-foreground">
                        Críticas
                      </Label>
                      <Switch
                        id="switch-criticas"
                        checked={formState.criticas}
                        onCheckedChange={(checked) =>
                          setFormState((prev) => ({ ...prev, criticas: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                      <Label htmlFor="switch-advertencias" className="text-sm text-foreground">
                        Advertencias
                      </Label>
                      <Switch
                        id="switch-advertencias"
                        checked={formState.advertencias}
                        onCheckedChange={(checked) =>
                          setFormState((prev) => ({ ...prev, advertencias: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                      <Label htmlFor="switch-informativas" className="text-sm text-foreground">
                        Informativas
                      </Label>
                      <Switch
                        id="switch-informativas"
                        checked={formState.informativas}
                        onCheckedChange={(checked) =>
                          setFormState((prev) => ({ ...prev, informativas: checked }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-full rounded-xl border-border/70 shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      3. Seguimiento
                    </CardTitle>
                    <CardDescription>
                      Define cada cuántos días se debe dar seguimiento según el nivel de riesgo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="seguimiento-bajo" className="text-xs uppercase tracking-wide">
                          Riesgo bajo
                        </Label>
                        <Input
                          id="seguimiento-bajo"
                          className="h-9"
                          type="number"
                          min={0}
                          value={formState.seguimiento_riesgo_bajo_dias}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              seguimiento_riesgo_bajo_dias: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="seguimiento-medio" className="text-xs uppercase tracking-wide">
                          Riesgo medio
                        </Label>
                        <Input
                          id="seguimiento-medio"
                          className="h-9"
                          type="number"
                          min={0}
                          value={formState.seguimiento_riesgo_medio_dias}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              seguimiento_riesgo_medio_dias: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="seguimiento-alto" className="text-xs uppercase tracking-wide">
                          Riesgo alto
                        </Label>
                        <Input
                          id="seguimiento-alto"
                          className="h-9"
                          type="number"
                          min={0}
                          value={formState.seguimiento_riesgo_alto_dias}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              seguimiento_riesgo_alto_dias: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-full rounded-xl border-border/70 shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Settings2 className="h-4 w-4 text-primary" />
                      4. Sistema
                    </CardTitle>
                    <CardDescription>
                      Parámetros generales del software. Esta sección es solo lectura.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="nombre-sistema">Nombre del sistema</Label>
                      <Input
                        id="nombre-sistema"
                        className="h-9"
                        type="text"
                        readOnly
                        disabled
                        value={formState.nombre_sistema}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="version-sistema">Versión</Label>
                      <Input
                        id="version-sistema"
                        className="h-9"
                        type="text"
                        readOnly
                        disabled
                        value={formState.version_sistema}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion-sistema">Descripción</Label>
                      <Textarea
                        id="descripcion-sistema"
                        className="min-h-24"
                        readOnly
                        disabled
                        value={formState.descripcion_sistema}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <section className="space-y-3">
                <Button onClick={() => void guardarCambios()} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Configuración"}
                </Button>

                {feedback && (
                  <p
                    className={
                      feedback.type === "success"
                        ? "text-sm font-medium text-emerald-600"
                        : "text-sm font-medium text-red-600"
                    }
                  >
                    {feedback.message}
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <Toaster />
    </div>
  )
}