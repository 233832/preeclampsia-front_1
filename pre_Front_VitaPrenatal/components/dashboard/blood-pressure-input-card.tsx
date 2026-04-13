"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface BloodPressureInputCardProps {
  systolic: number
  diastolic: number
  onSystolicChange: (value: number) => void
  onDiastolicChange: (value: number) => void
  hypertensionSystolicThreshold?: number
  hypertensionDiastolicThreshold?: number
}

type BPClassification = "normal" | "elevated" | "hypertension"

function classifyBloodPressure(
  systolic: number,
  diastolic: number,
  hypertensionSystolicThreshold: number,
  hypertensionDiastolicThreshold: number,
): BPClassification {
  if (systolic >= hypertensionSystolicThreshold || diastolic >= hypertensionDiastolicThreshold) {
    return "hypertension"
  }

  if (systolic >= 120 || diastolic >= 80) {
    return "elevated"
  }

  return "normal"
}

function getRangeDescription(min: number, threshold: number): string {
  const upper = threshold - 1

  if (upper < min) {
    return `< ${threshold}`
  }

  return `${min}-${upper}`
}

function buildClassificationConfig(hypertensionSystolicThreshold: number, hypertensionDiastolicThreshold: number) {
  return {
  normal: {
    label: "Normal",
    description: "< 120 / < 80 mmHg",
    bgColor: "bg-risk-low/10",
    textColor: "text-risk-low",
    borderColor: "border-risk-low",
  },
  elevated: {
    label: "Elevada",
    description: `${getRangeDescription(120, hypertensionSystolicThreshold)} / ${getRangeDescription(80, hypertensionDiastolicThreshold)} mmHg`,
    bgColor: "bg-risk-moderate/10",
    textColor: "text-risk-moderate",
    borderColor: "border-risk-moderate",
  },
  hypertension: {
    label: "Hipertension",
    description: `>= ${hypertensionSystolicThreshold} / >= ${hypertensionDiastolicThreshold} mmHg`,
    bgColor: "bg-risk-high/10",
    textColor: "text-risk-high",
    borderColor: "border-risk-high",
  },
}
}

export function BloodPressureInputCard({
  systolic,
  diastolic,
  onSystolicChange,
  onDiastolicChange,
  hypertensionSystolicThreshold = 140,
  hypertensionDiastolicThreshold = 90,
}: BloodPressureInputCardProps) {
  const classification = classifyBloodPressure(
    systolic,
    diastolic,
    hypertensionSystolicThreshold,
    hypertensionDiastolicThreshold,
  )
  const classificationConfig = buildClassificationConfig(
    hypertensionSystolicThreshold,
    hypertensionDiastolicThreshold,
  )
  const config = classificationConfig[classification]

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Activity className="h-5 w-5 text-primary" />
          Registro de Presion Arterial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="systolic" className="text-xs font-medium text-foreground">
              Sistolica (mmHg)
            </label>
            <Input
              id="systolic"
              type="number"
              value={systolic}
              onChange={(e) => onSystolicChange(Number(e.target.value))}
              min={70}
              max={200}
              className="text-lg font-semibold text-center h-12"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="diastolic" className="text-xs font-medium text-foreground">
              Diastolica (mmHg)
            </label>
            <Input
              id="diastolic"
              type="number"
              value={diastolic}
              onChange={(e) => onDiastolicChange(Number(e.target.value))}
              min={40}
              max={130}
              className="text-lg font-semibold text-center h-12"
            />
          </div>
        </div>

        {/* Classification Display */}
        <div className={cn("p-3 rounded-lg border-2", config.bgColor, config.borderColor)}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Clasificacion</p>
              <Badge variant="outline" className={cn("text-xs whitespace-nowrap", config.textColor, config.borderColor)}>
                {config.description}
              </Badge>
            </div>
            <p className={cn("text-lg font-bold", config.textColor)}>{config.label}</p>
          </div>
        </div>

        {/* Classification Legend */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Referencia:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-risk-low flex-shrink-0" />
              <span className="text-muted-foreground">Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-risk-moderate flex-shrink-0" />
              <span className="text-muted-foreground">Elevada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-risk-high flex-shrink-0" />
              <span className="text-muted-foreground">HTA</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
