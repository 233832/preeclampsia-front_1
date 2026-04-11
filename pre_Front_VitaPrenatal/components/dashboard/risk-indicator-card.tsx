"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ShieldCheck, AlertCircle, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

type BackendRisk = "NINGUNO" | "BAJO" | "MEDIO" | "ALTO"

interface RiskIndicatorCardProps {
  data?: {
    riesgo?: string;
    riesgo_ml?: string;
    confianza_ml?: number | string;
    score_total?: number | string;
  }
  isLoading?: boolean
}

const riskConfig = {
  NINGUNO: {
    label: "NINGUNO",
    icon: ShieldCheck,
    bgColor: "bg-muted/20",
    textColor: "text-muted-foreground",
    borderColor: "border-muted",
  },
  BAJO: {
    label: "BAJO",
    icon: AlertCircle,
    bgColor: "bg-risk-low/10",
    textColor: "text-risk-low",
    borderColor: "border-risk-low",
  },
  MEDIO: {
    label: "MEDIO",
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500",
  },
  ALTO: {
    label: "ALTO",
    icon: ShieldAlert,
    bgColor: "bg-risk-high/10",
    textColor: "text-risk-high",
    borderColor: "border-risk-high",
  },
}

const normalizeBackendRisk = (riesgo: string): BackendRisk => {
  switch ((riesgo || "NINGUNO").toUpperCase()) {
    case "BAJO":
      return "BAJO"
    case "MEDIO":
      return "MEDIO"
    case "ALTO":
      return "ALTO"
    case "NINGUNO":
    default:
      return "NINGUNO"
  }
}

function formatConfidence(value: number): string {
  const normalized = value > 0 && value <= 1 ? value * 100 : value
  return `${normalized.toFixed(2)}%`
}

export function RiskIndicatorCard({ data, isLoading = false }: RiskIndicatorCardProps) {
  const currentData = data ?? {}

  const scoreValue =
    typeof currentData.score_total === "number"
      ? currentData.score_total
      : typeof currentData.score_total === "string"
        ? Number.parseFloat(currentData.score_total)
        : null
  const confidenceValue =
    typeof currentData.confianza_ml === "number"
      ? currentData.confianza_ml
      : typeof currentData.confianza_ml === "string"
        ? Number.parseFloat(currentData.confianza_ml)
        : null

  const safeScoreValue = Number.isFinite(scoreValue as number) ? scoreValue : null
  const safeConfidenceValue = Number.isFinite(confidenceValue as number)
    ? confidenceValue
    : null

  const baseRisk = normalizeBackendRisk(currentData.riesgo || "NINGUNO")
  const riskLevel = baseRisk
  const mlRisk = normalizeBackendRisk(currentData.riesgo_ml || currentData.riesgo || "NINGUNO")

  const scoreText =
    safeScoreValue === null ? (isLoading ? "Cargando..." : "Pendiente de backend") : safeScoreValue.toFixed(2)
  const confidenceText =
    isLoading && safeConfidenceValue === null
      ? "Cargando..."
      : safeConfidenceValue === null
        ? "No disponible"
        : formatConfidence(safeConfidenceValue)

  const config = riskConfig[riskLevel]
  const Icon = config.icon

  return (
    <Card className={cn("border-2 shadow-lg", config.borderColor, config.bgColor)}>
      <CardHeader className="pb-2 space-y-2">
        <CardTitle className="flex justify-center">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold tracking-wide shadow-sm",
              config.bgColor,
              config.textColor,
              config.borderColor,
            )}
          >
            <Icon className="h-4 w-4" />
            Indicador de Riesgo
          </span>
        </CardTitle>
        <p className="text-center text-xs text-muted-foreground">
          Evaluacion clinica basada en factores maternos
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pt-2">
        {/* Horizontal Traffic Light System - 4 levels */}
        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-inner">
          {/* Ningún Riesgo - Gris */}
          <div
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-500 shadow-md cursor-help",
              riskLevel === "NINGUNO" ? "bg-muted shadow-muted/50 scale-110" : "bg-muted/30 opacity-50"
            )}
            title="Ningún Riesgo - Sin indicadores de preeclampsia"
          />
          {/* Riesgo Bajo - Verde */}
          <div
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-500 shadow-md cursor-help",
              riskLevel === "BAJO" ? "bg-risk-low shadow-risk-low/50 scale-110" : "bg-risk-low/30 opacity-50"
            )}
            title="Riesgo Bajo - Monitoreo regular recomendado"
          />
          {/* Riesgo Medio - Amarillo */}
          <div
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-500 shadow-md cursor-help",
              riskLevel === "MEDIO" ? "bg-yellow-500 shadow-yellow-500/50 scale-110" : "bg-yellow-500/30 opacity-50"
            )}
            title="Riesgo Medio - Atención médica inmediata requerida"
          />
          {/* Riesgo Alto - Rojo */}
          <div
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-500 shadow-md cursor-help",
              riskLevel === "ALTO" ? "bg-risk-high shadow-risk-high/50 scale-110" : "bg-risk-high/30 opacity-50"
            )}
            title="Riesgo Alto - Intervención médica urgente necesaria"
          />
        </div>

        {/* Risk Level Badge */}
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.textColor)} />
          <span className={cn("text-lg font-bold", config.textColor)}>
            {config.label}
          </span>
        </div>

        {/* ML Risk and Confidence */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            ML: {mlRisk}
          </p>
          <p className="text-xs text-muted-foreground">
            Confianza: {confidenceText}
          </p>
        </div>

        {/* Score - Less prominent */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Score: {scoreText}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
