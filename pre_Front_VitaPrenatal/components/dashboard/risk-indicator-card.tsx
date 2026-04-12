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
    color: "#B0BEC5",
    bgColor: "bg-muted/20",
    textColor: "text-muted-foreground",
    borderColor: "border-muted/70",
  },
  BAJO: {
    label: "BAJO",
    icon: AlertCircle,
    color: "#55efc4",
    bgColor: "bg-risk-low/10",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-300",
  },
  MEDIO: {
    label: "MEDIO",
    icon: AlertTriangle,
    color: "#ffeaa7",
    bgColor: "bg-amber-100/60",
    textColor: "text-amber-700",
    borderColor: "border-amber-300",
  },
  ALTO: {
    label: "ALTO",
    icon: ShieldAlert,
    color: "#ff7675",
    bgColor: "bg-rose-100/60",
    textColor: "text-rose-700",
    borderColor: "border-rose-300",
  },
}

const trafficOrder: BackendRisk[] = ["NINGUNO", "BAJO", "MEDIO", "ALTO"]

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
    <Card
      className={cn("border-2 shadow-lg transition-all duration-500", config.borderColor, config.bgColor)}
      style={{ boxShadow: `0 10px 24px ${config.color}33` }}
    >
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
          {trafficOrder.map((level) => {
            const levelConfig = riskConfig[level]
            const isActive = level === riskLevel

            return (
              <div
                key={level}
                className="w-7 h-7 rounded-full border transition-all duration-500"
                title={`Nivel ${level}`}
                style={{
                  backgroundColor: levelConfig.color,
                  borderColor: levelConfig.color,
                  opacity: isActive ? 1 : 0.28,
                  transform: isActive ? "scale(1.15)" : "scale(1)",
                  boxShadow: isActive
                    ? `0 0 0 2px ${levelConfig.color}55, 0 0 18px ${levelConfig.color}`
                    : "none",
                }}
              />
            )
          })}
        </div>

        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.textColor)} />
          <span className={cn("text-lg font-bold", config.textColor)}>
            {config.label}
          </span>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            ML: {mlRisk}
          </p>
          <p className="text-xs text-muted-foreground">
            Confianza: {confidenceText}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-muted-foreground font-medium">
            Score: {scoreText}
          </p>
          {isLoading && (
            <p className="text-[11px] text-primary mt-1 animate-pulse">
              Generando analisis clinico...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
