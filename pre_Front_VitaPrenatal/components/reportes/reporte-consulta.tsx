"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CircleCheckBig,
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { consultaService } from "@/servicios/consultaService"
import { pacienteService } from "@/servicios/pacienteService"
import { reporteService } from "@/servicios/reporteService"
import type { Consulta } from "@/interfaz/consulta"
import type { PacienteResponse } from "@/interfaz/paciente"
import { formatDateTimeInMexico } from "@/lib/mexico-time"

type ReportAction = "preview" | "pdf" | null

interface ReporteConsultaProps {
  consultaIdParam?: string | number
}

function parseConsultaId(value: string | number | undefined): number | null {
  if (value === undefined || value === null) {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }

  return Math.trunc(parsed)
}

function noRegistrado(value: unknown): string {
  if (value === null || value === undefined) {
    return "No registrado"
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length === 0 ? "No registrado" : trimmed
  }

  return String(value)
}

function formatDateTime(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "No registrado"
  }

  return formatDateTimeInMexico(value, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }, "No registrado")
}

function formatPressure(sistolica: unknown, diastolica: unknown): string {
  if (
    typeof sistolica === "number" &&
    Number.isFinite(sistolica) &&
    typeof diastolica === "number" &&
    Number.isFinite(diastolica)
  ) {
    return `${sistolica}/${diastolica} mmHg`
  }

  return "No registrado"
}

function formatNumberValue(value: unknown, digits = 2): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "No registrado"
  }

  return value.toFixed(digits)
}

export function ReporteConsulta({ consultaIdParam }: ReporteConsultaProps) {
  const consultaId = useMemo(() => parseConsultaId(consultaIdParam), [consultaIdParam])

  const [consulta, setConsulta] = useState<Consulta | null>(null)
  const [paciente, setPaciente] = useState<PacienteResponse | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [loadingAction, setLoadingAction] = useState<ReportAction>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [retryAction, setRetryAction] = useState<ReportAction>(null)

  const loadReportData = useCallback(async () => {
    if (!consultaId) {
      setConsulta(null)
      setPaciente(null)
      setLoadError("El ID de consulta no es valido.")
      return
    }

    setLoadingData(true)
    setLoadError(null)

    try {
      const consultaResponse = await consultaService.obtenerPorId(consultaId)
      setConsulta(consultaResponse)

      const pacienteId = Number(consultaResponse.paciente_id)

      if (Number.isFinite(pacienteId) && pacienteId > 0) {
        const pacienteResponse = await pacienteService.obtenerPorId(pacienteId)
        setPaciente(pacienteResponse)
      } else {
        setPaciente(null)
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible obtener los datos clinicos para el reporte."

      setLoadError(message)
      setConsulta(null)
      setPaciente(null)
    } finally {
      setLoadingData(false)
    }
  }, [consultaId])

  useEffect(() => {
    void loadReportData()
  }, [loadReportData])

  const runReportAction = async (action: Exclude<ReportAction, null>) => {
    if (!consultaId) {
      setActionError("No hay un ID de consulta valido para generar el reporte.")
      setRetryAction(action)
      return
    }

    setLoadingAction(action)
    setActionError(null)
    setActionSuccess(null)
    setRetryAction(null)

    try {
      if (action === "preview") {
        await reporteService.abrirVistaPrevia(consultaId)
        setActionSuccess("Vista previa abierta correctamente.")
        return
      }

      await reporteService.descargarPdf(consultaId)
      setActionSuccess("PDF descargado correctamente.")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible completar la accion de reporte clinico."

      setActionError(message)
      setRetryAction(action)
    } finally {
      setLoadingAction(null)
    }
  }

  const isPreviewLoading = loadingAction === "preview"
  const isPdfLoading = loadingAction === "pdf"

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-sm bg-gradient-to-b from-primary/5 to-background">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-primary" />
            Reporte Clinico VitaPrenatal
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Consulta: {consultaId ?? "No registrado"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingData && (
            <div className="rounded-lg border border-border/60 bg-card p-3 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando datos clinicos del reporte...
            </div>
          )}

          {!loadingData && loadError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-2">
              <p className="text-sm text-destructive">{loadError}</p>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => void loadReportData()}>
                <RefreshCw className="h-4 w-4" />
                Reintentar carga
              </Button>
            </div>
          )}

          {!loadingData && !loadError && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Paciente</p>
                <p className="text-sm font-medium">{noRegistrado(paciente?.nombre)}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Edad materna</p>
                <p className="text-sm font-medium">{noRegistrado(consulta?.edad_madre)}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Fecha de consulta</p>
                <p className="text-sm font-medium">{formatDateTime(consulta?.fecha_hora_consulta)}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Edad gestacional</p>
                <p className="text-sm font-medium">{noRegistrado(consulta?.edad_gestacional)}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Presion arterial</p>
                <p className="text-sm font-medium">
                  {formatPressure(consulta?.presion_sistolica, consulta?.presion_diastolica)}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">IMC</p>
                <p className="text-sm font-medium">{formatNumberValue(consulta?.imc)}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Riesgo</p>
                <p className="text-sm font-medium">{noRegistrado(consulta?.riesgo)}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Interpretacion</p>
                <p className="text-sm font-medium line-clamp-2">
                  {noRegistrado(consulta?.interpretacion)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Acciones de Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => void runReportAction("preview")}
              disabled={!!loadError || loadingData || loadingAction !== null}
            >
              {isPreviewLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Abriendo vista previa...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Ver vista previa
                </>
              )}
            </Button>

            <Button
              type="button"
              className="gap-2"
              onClick={() => void runReportAction("pdf")}
              disabled={!!loadError || loadingData || loadingAction !== null}
            >
              {isPdfLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Descargando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </>
              )}
            </Button>
          </div>

          {actionSuccess && (
            <div className="rounded-lg border border-emerald-400/50 bg-emerald-50 p-3 text-emerald-700 text-sm flex items-center gap-2">
              <CircleCheckBig className="h-4 w-4" />
              {actionSuccess}
            </div>
          )}

          {actionError && (
            <div className="rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-amber-800 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{actionError}</span>
              </div>

              {retryAction && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => void runReportAction(retryAction)}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
