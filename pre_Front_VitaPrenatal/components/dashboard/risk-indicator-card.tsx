"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ShieldCheck, AlertCircle, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

type RiskLevel = "low" | "moderate" | "high" | "very-high"

interface RiskIndicatorCardProps {
  riskLevel: RiskLevel
}

const riskConfig = {
  low: {
    label: "Riesgo Bajo",
    probability: 0,
    icon: ShieldCheck,
    bgColor: "bg-risk-low/10",
    textColor: "text-risk-low",
    borderColor: "border-risk-low",
    indicatorBg: "bg-risk-low",
  },
  moderate: {
    label: "Riesgo Moderado",
    probability: 33.3,
    icon: AlertCircle,
    bgColor: "bg-risk-moderate/10",
    textColor: "text-risk-moderate",
    borderColor: "border-risk-moderate",
    indicatorBg: "bg-risk-moderate",
  },
  high: {
    label: "Riesgo Alto",
    probability: 66.6,
    icon: AlertTriangle,
    bgColor: "bg-risk-high/10",
    textColor: "text-risk-high",
    borderColor: "border-risk-high",
    indicatorBg: "bg-risk-high",
  },
  "very-high": {
    label: "Riesgo Muy Alto",
    probability: 99.9,
    icon: ShieldAlert,
    bgColor: "bg-risk-high/15",
    textColor: "text-risk-high",
    borderColor: "border-risk-high",
    indicatorBg: "bg-risk-high",
  },
}

export function RiskIndicatorCard({ riskLevel }: RiskIndicatorCardProps) {
  const config = riskConfig[riskLevel]
  const Icon = config.icon

  return (
    <Card className={cn("border-2 shadow-lg", config.borderColor, config.bgColor)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-base font-semibold text-foreground">
          Indicador de Riesgo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pt-2">
        {/* Traffic Light System */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/50 shadow-inner">
          <div
            className={cn(
              "w-8 h-8 rounded-full transition-all duration-300 shadow-md",
              riskLevel === "low" ? "bg-risk-low shadow-risk-low/50" : "bg-muted"
            )}
          />
          <div
            className={cn(
              "w-8 h-8 rounded-full transition-all duration-300 shadow-md",
              riskLevel === "moderate" ? "bg-risk-moderate shadow-risk-moderate/50" : "bg-muted"
            )}
          />
          <div
            className={cn(
              "w-8 h-8 rounded-full transition-all duration-300 shadow-md",
              riskLevel === "high" || riskLevel === "very-high" ? "bg-risk-high shadow-risk-high/50" : "bg-muted"
            )}
          />
        </div>

        {/* Risk Level Badge */}
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.textColor)} />
          <span className={cn("text-lg font-bold", config.textColor)}>
            {config.label}
          </span>
        </div>

        {/* Probability Display */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Probabilidad estimada
          </p>
          <div className="flex items-baseline justify-center gap-0.5">
            <span className={cn("text-4xl font-bold", config.textColor)}>
              {config.probability}
            </span>
            <span className={cn("text-xl font-semibold", config.textColor)}>%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full px-2">
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", config.indicatorBg)}
              style={{ width: `${config.probability}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
