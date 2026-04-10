"use client"

import { useEffect, useMemo, useState } from "react"
import { MainNav } from "@/components/navigation/main-nav"
import { useConfiguration } from "@/lib/configuration-context"
import { FrecuenciaSeguimientoDias } from "@/interfaz/configuracion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BellRing, CalendarClock, HeartPulse, Info, Save, Settings2 } from "lucide-react"

const frecuenciaOptions: Array<{ value: FrecuenciaSeguimientoDias; label: string }> = [
  { value: 7, label: "Cada 7 días" },
  { value: 14, label: "Cada 14 días" },
  { value: 30, label: "Cada 30 días" },
]

export default function ConfiguracionesPage() {
  const {
    configuraciones,
    loadingConfiguraciones,
    setUmbrales,
    setFrecuenciaSeguimiento,
    setNotificacionesActivas,
    setCanalesNotificacion,
  } = useConfiguration()

  const [umbralSistolicoInput, setUmbralSistolicoInput] = useState(
    String(configuraciones.umbralSistolico),
  )
  const [umbralDiastolicoInput, setUmbralDiastolicoInput] = useState(
    String(configuraciones.umbralDiastolico),
  )

  useEffect(() => {
    setUmbralSistolicoInput(String(configuraciones.umbralSistolico))
    setUmbralDiastolicoInput(String(configuraciones.umbralDiastolico))
  }, [configuraciones.umbralSistolico, configuraciones.umbralDiastolico])

  const guardarUmbrales = () => {
    const sistolica = Number.parseInt(umbralSistolicoInput, 10)
    const diastolica = Number.parseInt(umbralDiastolicoInput, 10)

    setUmbrales(
      Number.isNaN(sistolica) ? configuraciones.umbralSistolico : Math.max(80, sistolica),
      Number.isNaN(diastolica) ? configuraciones.umbralDiastolico : Math.max(50, diastolica),
    )
  }

  const backendPayloadPreview = useMemo(
    () => JSON.stringify(configuraciones, null, 2),
    [configuraciones],
  )

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Settings2 className="h-6 w-6 text-primary" />
            Configuraciones Clínicas
          </h2>
          <p className="text-sm text-muted-foreground">
            Ajuste los parámetros del sistema para controlar alertas, seguimiento y reglas clínicas.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HeartPulse className="h-4 w-4 text-primary" />
                Umbrales de Presión Arterial
              </CardTitle>
              <CardDescription>
                Defina los límites de referencia para activar alertas de monitoreo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="umbral-sistolico">Sistólica (mmHg)</Label>
                  <Input
                    id="umbral-sistolico"
                    type="number"
                    min={80}
                    value={umbralSistolicoInput}
                    onChange={(event) => setUmbralSistolicoInput(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="umbral-diastolico">Diastólica (mmHg)</Label>
                  <Input
                    id="umbral-diastolico"
                    type="number"
                    min={50}
                    value={umbralDiastolicoInput}
                    onChange={(event) => setUmbralDiastolicoInput(event.target.value)}
                  />
                </div>
              </div>

              <Button onClick={guardarUmbrales} className="gap-2" disabled={loadingConfiguraciones}>
                <Save className="h-4 w-4" />
                Guardar umbrales
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4 text-primary" />
                Frecuencia de Seguimiento
              </CardTitle>
              <CardDescription>
                Seleccione cada cuánto tiempo debe realizarse el control clínico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="frecuencia-seguimiento" className="mb-2 block">
                Intervalo
              </Label>
              <Select
                value={String(configuraciones.frecuenciaSeguimiento)}
                onValueChange={(value) =>
                  setFrecuenciaSeguimiento(Number(value) as FrecuenciaSeguimientoDias)
                }
              >
                <SelectTrigger id="frecuencia-seguimiento" className="w-full">
                  <SelectValue placeholder="Seleccione un intervalo" />
                </SelectTrigger>
                <SelectContent>
                  {frecuenciaOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BellRing className="h-4 w-4 text-primary" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Controle qué tipos de alertas aparecen en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/70 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Activar notificaciones</p>
                  <p className="text-xs text-muted-foreground">Habilita o deshabilita el módulo completo.</p>
                </div>
                <Switch
                  checked={configuraciones.notificacionesActivas}
                  onCheckedChange={setNotificacionesActivas}
                />
              </div>

              <div className="space-y-3 rounded-xl border border-border/70 bg-card/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">Alertas críticas</p>
                  <Switch
                    checked={configuraciones.criticas}
                    onCheckedChange={(checked) => setCanalesNotificacion({ criticas: checked })}
                    disabled={!configuraciones.notificacionesActivas}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">Advertencias</p>
                  <Switch
                    checked={configuraciones.advertencias}
                    onCheckedChange={(checked) => setCanalesNotificacion({ advertencias: checked })}
                    disabled={!configuraciones.notificacionesActivas}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">Informativas</p>
                  <Switch
                    checked={configuraciones.informativas}
                    onCheckedChange={(checked) => setCanalesNotificacion({ informativas: checked })}
                    disabled={!configuraciones.notificacionesActivas}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-primary" />
                Información del Sistema
              </CardTitle>
              <CardDescription>
                Datos del producto y estructura lista para integración con FastAPI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <p><span className="font-semibold text-foreground">Nombre:</span> VitaPrenatal</p>
                <p><span className="font-semibold text-foreground">Versión:</span> 1.0.0</p>
                <p><span className="font-semibold text-foreground">Tecnología:</span> Machine Learning</p>
                <p><span className="font-semibold text-foreground">Enfoque:</span> Predicción de Preeclampsia</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Payload listo para backend
                </p>
                <pre className="overflow-auto text-xs text-foreground">{backendPayloadPreview}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-8 border-t border-border/50 bg-card/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <p className="font-medium">VitaPrenatal</p>
            <p className="max-w-md text-xs">
              Sistema de apoyo clinico. No sustituye el juicio medico profesional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}