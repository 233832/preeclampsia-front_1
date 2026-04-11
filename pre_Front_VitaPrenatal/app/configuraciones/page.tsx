"use client"

import { useEffect, useState } from "react"
import { MainNav } from "@/components/navigation/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { HeartPulse, Save, Settings2 } from "lucide-react"
import {
  getConfiguraciones,
  updateConfiguraciones,
  type ConfiguracionesPayload,
} from "@/services/configuracionService"

interface ConfiguracionFormState {
  umbral_sistolico: string
  umbral_diastolico: string
  criticas: boolean
  advertencias: boolean
  informativas: boolean
}

interface FeedbackState {
  type: "success" | "error"
  message: string
}

function toFormState(data: ConfiguracionesPayload): ConfiguracionFormState {
  return {
    umbral_sistolico: String(data.umbral_sistolico),
    umbral_diastolico: String(data.umbral_diastolico),
    criticas: data.criticas,
    advertencias: data.advertencias,
    informativas: data.informativas,
  }
}

export default function ConfiguracionesPage() {
  const [formState, setFormState] = useState<ConfiguracionFormState>({
    umbral_sistolico: "",
    umbral_diastolico: "",
    criticas: false,
    advertencias: false,
    informativas: false,
  })
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
          setFormState(toFormState(data))
        }
      } catch (error) {
        console.error("No se pudieron cargar configuraciones", error)

        if (isMounted) {
          setFeedback({
            type: "error",
            message: "No se pudieron cargar las configuraciones.",
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

  const guardarCambios = async () => {
    const sistolica = Number(formState.umbral_sistolico)
    const diastolica = Number(formState.umbral_diastolico)

    if (!Number.isFinite(sistolica) || !Number.isFinite(diastolica)) {
      setFeedback({
        type: "error",
        message: "Ingrese valores numéricos válidos para la presión arterial.",
      })
      return
    }

    setSaving(true)
    setFeedback(null)

    try {
      const payload: ConfiguracionesPayload = {
        umbral_sistolico: sistolica,
        umbral_diastolico: diastolica,
        criticas: formState.criticas,
        advertencias: formState.advertencias,
        informativas: formState.informativas,
      }

      const updated = await updateConfiguraciones(payload)
      setFormState(toFormState(updated))
      setFeedback({ type: "success", message: "Configuración actualizada" })
    } catch (error) {
      console.error("No se pudieron guardar configuraciones", error)
      setFeedback({
        type: "error",
        message: "No fue posible guardar la configuración.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="space-y-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Settings2 className="h-6 w-6 text-primary" />
              Configuraciones Clínicas
            </h2>
            <p className="text-sm text-muted-foreground">
              Ajuste parámetros de presión arterial y tipos de alerta del sistema.
            </p>
          </div>

          {loading ? (
            <Card className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Cargando configuraciones...
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-xl border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <HeartPulse className="h-4 w-4 text-primary" />
                  Parámetros Clínicos
                </CardTitle>
                <CardDescription>
                  Configure umbrales y controle qué alertas se mostrarán en el monitoreo.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Presión arterial</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="umbral-sistolico">Sistólica</Label>
                      <Input
                        id="umbral-sistolico"
                        type="number"
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
                      <Label htmlFor="umbral-diastolico">Diastólica</Label>
                      <Input
                        id="umbral-diastolico"
                        type="number"
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
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Tipos de alerta</h3>
                  <div className="space-y-2 rounded-lg border border-border/70 p-3">
                    <div className="flex items-center justify-between">
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

                    <div className="flex items-center justify-between">
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

                    <div className="flex items-center justify-between">
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
                  </div>
                </section>

                <section className="space-y-3">
                  <Button onClick={() => void guardarCambios()} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar cambios"}
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
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}