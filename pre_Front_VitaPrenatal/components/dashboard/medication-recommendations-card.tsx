"use client"

import { useMemo } from "react"
import type { MedicacionResponse } from "@/interfaz/medicacion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Pill, Sparkles, ClipboardList, TriangleAlert } from "lucide-react"

interface MedicationRecommendationsCardProps {
  loading: boolean
  error: string | null
  invalidRiskMessage: string | null
  data: MedicacionResponse | null
  onRetry?: () => void
}

function getEstadoResumen(estado: MedicacionResponse["estado"]): string {
  if (estado === "Control") {
    return "Seguimiento sin intervencion inmediata"
  }

  if (estado === "Indicada") {
    return "Requiere tratamiento farmacologico"
  }

  if (estado === "Emergencia") {
    return "Atencion inmediata requerida"
  }

  return "Sin indicacion farmacologica actual"
}

function getInterpretacionGlobal(estado: MedicacionResponse["estado"], groupsCount: number): string | null {
  if (estado === "Emergencia" && groupsCount > 1) {
    return "Tratamiento complejo de alta vigilancia"
  }

  if (estado === "Emergencia") {
    return "Manejo farmacologico de emergencia con vigilancia estrecha"
  }

  if (estado === "Indicada" && groupsCount > 1) {
    return "Tratamiento farmacologico combinado con seguimiento clinico"
  }

  if (estado === "Indicada") {
    return "Tratamiento farmacologico dirigido y seguimiento regular"
  }

  if (estado === "Control") {
    return "Plan de control con vigilancia periodica"
  }

  return "Continuar vigilancia clinica y reevaluacion"
}

function getEstadoBadgeClass(estado: MedicacionResponse["estado"]): string {
  if (estado === "Emergencia") {
    return "border-destructive/40 bg-destructive/10 text-destructive"
  }

  if (estado === "Indicada") {
    return "border-risk-high/40 bg-risk-high/10 text-risk-high"
  }

  if (estado === "Control") {
    return "border-primary/40 bg-primary/10 text-primary"
  }

  return "border-muted bg-muted/30 text-muted-foreground"
}

function hasValue(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export function MedicationRecommendationsCard({
  loading,
  error,
  invalidRiskMessage,
  data,
  onRetry,
}: MedicationRecommendationsCardProps) {
  const groupedAlerts = useMemo(() => {
    if (!data) {
      return []
    }

    return data.detalle.flatMap((group) =>
      group.medicamentos
        .filter((medication) => hasValue(medication.alerta) && hasValue(medication.nombre))
        .map((medication) => ({
          group: group.grupo,
          medicationName: medication.nombre!.trim(),
          alert: medication.alerta!.trim(),
        })),
    )
  }, [data])

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Pill className="h-4 w-4 text-primary" />
          Recomendaciones de medicamentos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Cargando recomendaciones de medicamentos...</p>}

        {invalidRiskMessage && (
          <div className="rounded-lg border border-amber-300/70 bg-amber-50/60 p-3">
            <p className="text-sm text-amber-800">{invalidRiskMessage}</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && !invalidRiskMessage && !data && (
          <p className="text-sm text-muted-foreground">No hay recomendaciones de medicamentos para mostrar.</p>
        )}

        {!loading && data && (
          <>
            <section className="rounded-lg border border-border/60 bg-muted/15 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Estado clinico principal
                  </p>
                  <p className="mt-1 text-lg font-semibold leading-tight text-foreground">{data.estado}</p>
                </div>

                <Badge variant="outline" className={cn("shrink-0", getEstadoBadgeClass(data.estado))}>
                  {data.estado}
                </Badge>
              </div>

              <div className="mt-3 flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Resumen del estado</p>
                  <p className="text-sm text-muted-foreground">{getEstadoResumen(data.estado)}</p>
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Grupos de medicamentos</h4>

              {data.detalle.map((group) => (
                <article key={group.grupo} className="rounded-lg border border-border/60 bg-card/40 p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      {group.grupo}
                    </h5>
                    <Badge variant="outline">{group.medicamentos.filter((m) => hasValue(m.nombre)).length} medicamentos</Badge>
                  </div>

                  <div className="space-y-3">
                    {group.medicamentos
                      .filter((medication) => hasValue(medication.nombre))
                      .map((medication, index) => (
                        <div key={`${group.grupo}-${medication.nombre}-${index}`} className="rounded-lg border border-border/70 bg-background/80 p-3">
                          <p className="text-sm font-semibold text-foreground">{medication.nombre}</p>

                          <div className="mt-2 space-y-1 text-sm text-foreground/90">
                            {hasValue(medication.dosis) && <p><span className="font-medium">Dosis:</span> {medication.dosis}</p>}
                            {hasValue(medication.frecuencia) && <p><span className="font-medium">Frecuencia:</span> {medication.frecuencia}</p>}
                            {hasValue(medication.inicio) && <p><span className="font-medium">Inicio:</span> {medication.inicio}</p>}
                            {hasValue(medication.horario) && <p><span className="font-medium">Horario:</span> {medication.horario}</p>}
                            {hasValue(medication.max) && <p><span className="font-medium">Maximo:</span> {medication.max}</p>}
                            {hasValue(medication.suspension) && <p><span className="font-medium">Suspension:</span> {medication.suspension}</p>}
                          </div>

                          {hasValue(medication.alerta) && (
                            <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1.5 text-sm text-destructive">
                              <span className="font-medium">Alerta:</span> {" "}
                              {medication.alerta}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </article>
              ))}
            </section>

            {groupedAlerts.length > 0 && (
              <section className="rounded-lg border border-destructive/35 bg-destructive/5 p-3">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
                  <TriangleAlert className="h-4 w-4" />
                  Medicamentos con alerta
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                  {groupedAlerts.map((alertItem, index) => (
                    <li key={`${alertItem.group}-${alertItem.medicationName}-${index}`}>
                      {alertItem.medicationName} ({alertItem.group}): {alertItem.alert}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-lg border border-border/60 bg-muted/10 p-3">
              <h4 className="text-sm font-semibold text-foreground">Interpretacion general del tratamiento</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {getInterpretacionGlobal(data.estado, data.detalle.length)}
              </p>
            </section>
          </>
        )}

        {onRetry && (
          <div className="pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onRetry} className="w-full sm:w-auto">
              Reintentar medicacion
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
