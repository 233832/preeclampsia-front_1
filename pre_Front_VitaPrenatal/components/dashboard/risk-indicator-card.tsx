"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ShieldCheck, AlertCircle, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

type RiskLevel = "low" | "moderate" | "high" | "very-high"

interface RiskIndicatorCardProps {
  data?: {
    riesgo: string;
    riesgo_ml: string;
    confianza_ml: number;
    score_total: number;
  }
}

const riskConfig = {
  low: {
    label: "Ningún Riesgo",
    icon: ShieldCheck,
    bgColor: "bg-muted/20",
    textColor: "text-muted-foreground",
    borderColor: "border-muted",
    indicatorBg: "bg-muted",
    activeColor: "bg-muted",
  },
  moderate: {
    label: "Riesgo Bajo",
    icon: AlertCircle,
    bgColor: "bg-risk-low/10",
    textColor: "text-risk-low",
    borderColor: "border-risk-low",
    indicatorBg: "bg-risk-low",
    activeColor: "bg-risk-low",
  },
  high: {
    label: "Riesgo Medio",
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500",
    indicatorBg: "bg-yellow-500",
    activeColor: "bg-yellow-500",
  },
  "very-high": {
    label: "Riesgo Alto",
    icon: ShieldAlert,
    bgColor: "bg-risk-high/10",
    textColor: "text-risk-high",
    borderColor: "border-risk-high",
    indicatorBg: "bg-risk-high",
    activeColor: "bg-risk-high",
  },
}

const getRiskLevel = (riesgo: string): RiskLevel => {
  switch (riesgo.toLowerCase()) {
    case 'ninguno': return 'low';
    case 'bajo': return 'moderate';
    case 'medio': return 'high';
    case 'alto': return 'very-high';
    default: return 'low';
  }
};

export function RiskIndicatorCard({ data }: RiskIndicatorCardProps) {
  const defaultData = {
    riesgo: "BAJO",
    riesgo_ml: "BAJO",
    confianza_ml: 0,
    score_total: 0
  };
  
  const currentData = data || defaultData;
  const riskLevel = getRiskLevel(currentData.riesgo || "BAJO");
  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  useEffect(() => {
    console.log("🎯 RiskIndicatorCard recibió data:", currentData);
  }, [currentData])

  return (
    <Card className={cn("border-2 shadow-lg", config.borderColor, config.bgColor)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-base font-semibold text-foreground">
          Indicador de Riesgo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pt-2">
        {/* Horizontal Traffic Light System - 4 levels */}
        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-inner">
          {/* Ningún Riesgo - Gris */}
          <div
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-500 shadow-md cursor-help",
              riskLevel === "low" ? "bg-muted shadow-muted/50 scale-110" : "bg-muted/30 opacity-50"
            )}
            title="Ningún Riesgo - Sin indicadores de preeclampsia"
          />
          {/* Riesgo Bajo - Verde */}
          <div
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-500 shadow-md cursor-help",
              riskLevel === "moderate" ? "bg-risk-low shadow-risk-low/50 scale-110" : "bg-risk-low/30 opacity-50"
            )}
            title="Riesgo Bajo - Monitoreo regular recomendado"
          />
          {/* Riesgo Medio - Amarillo */}
          <div
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-500 shadow-md cursor-help",
              riskLevel === "high" ? "bg-yellow-500 shadow-yellow-500/50 scale-110" : "bg-yellow-500/30 opacity-50"
            )}
            title="Riesgo Medio - Atención médica inmediata requerida"
          />
          {/* Riesgo Alto - Rojo */}
          <div
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-500 shadow-md cursor-help",
              riskLevel === "very-high" ? "bg-risk-high shadow-risk-high/50 scale-110" : "bg-risk-high/30 opacity-50"
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
            ML: {currentData.riesgo_ml || 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">
            Confianza: {typeof currentData.confianza_ml === 'number' ? `${currentData.confianza_ml}%` : 'N/A'}
          </p>
        </div>

        {/* Score - Less prominent */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Score: {typeof currentData.score_total === 'number' ? currentData.score_total.toFixed(2) : 'N/A'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
