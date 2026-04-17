"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ShieldCheck, AlertCircle, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { normalizeClinicalRisk, NormalizedRisk } from "@/lib/risk-normalization"

type BackendRisk = NormalizedRisk

interface RiskIndicatorCardProps {
  data?: {
    riesgo?: string;
    riesgo_ml?: string | null;
    riesgo_ml_modelo?: string | null;
    confianza_ml?: number | string | null;
    score_total?: number | string | null;
  }
  isLoading?: boolean
  errorMessage?: string | null
  onRetry?: () => void
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
  MEDIO: {
    label: "MEDIO",
    icon: AlertCircle,
    color: "#facc15",
    bgColor: "bg-amber-100/60",
    textColor: "text-amber-700",
    borderColor: "border-amber-300",
  },
  ALTO: {
    label: "ALTO",
    icon: ShieldAlert,
    color: "#f97316",
    bgColor: "bg-orange-100/60",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
  },
  HOSPITALIZACION: {
    label: "HOSPITALIZACION",
    icon: AlertTriangle,
    color: "#ef4444",
    bgColor: "bg-rose-100/60",
    textColor: "text-rose-700",
    borderColor: "border-rose-300",
  },
}

const trafficOrder: BackendRisk[] = ["NINGUNO", "MEDIO", "ALTO", "HOSPITALIZACION"]

function formatConfidence(value: number): string {
  const normalized = value > 0 && value <= 1 ? value * 100 : value
  return `${normalized.toFixed(2)}%`
}

function parseOptionalNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }

  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function RiskIndicatorCard({
  data,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: RiskIndicatorCardProps) {
  const currentData = data ?? {}
  const hasScore = currentData.score_total !== null && currentData.score_total !== undefined
  const hasConfidence = currentData.confianza_ml !== null && currentData.confianza_ml !== undefined

  const scoreValue = parseOptionalNumber(currentData.score_total)
  const confidenceValue = parseOptionalNumber(currentData.confianza_ml)

  const baseRisk = normalizeClinicalRisk(currentData.riesgo || "NINGUNO")
  const riskLevel = baseRisk
  const modelRiskDetail =
    typeof currentData.riesgo_ml_modelo === "string" && currentData.riesgo_ml_modelo.trim()
      ? currentData.riesgo_ml_modelo.trim().toUpperCase()
      : null

  const scoreText = !hasScore
    ? isLoading
      ? "Cargando..."
      : "Pendiente de backend"
    : scoreValue === null
      ? "Dato no disponible"
      : scoreValue.toFixed(2)
  const confidenceText = confidenceValue === null ? "No disponible" : formatConfidence(confidenceValue)

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
            Riesgo principal: {config.label}
          </span>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Detalle tecnico ML: {modelRiskDetail ?? "No disponible"}
          </p>
          {confidenceValue !== null && (
            <p className="text-xs text-muted-foreground">Confianza ML: {confidenceText}</p>
          )}
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

        {errorMessage && (
          <div className="w-full rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-center">
            <p className="text-xs text-destructive">{errorMessage}</p>
            {onRetry && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2"
                disabled={isLoading}
                onClick={onRetry}
              >
                Reintentar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
