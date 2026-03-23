"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, CheckCircle2, AlertCircle } from "lucide-react"

interface ObstetricHistory {
  previousHypertension: boolean
  diabetes: boolean
  familyHypertensionHistory: boolean
}

interface ObstetricHistoryCardProps {
  history: ObstetricHistory
}

export function ObstetricHistoryCard({ history }: ObstetricHistoryCardProps) {
  const riskFactors = [
    { label: "Hipertension previa", value: history.previousHypertension },
    { label: "Diabetes", value: history.diabetes },
    { label: "Antecedentes familiares de hipertension", value: history.familyHypertensionHistory },
  ]

  const activeRiskFactors = riskFactors.filter(f => f.value).length

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <ClipboardList className="h-5 w-5 text-primary" />
            Antecedentes Obstetricos
          </CardTitle>
          {activeRiskFactors > 0 && (
            <Badge variant="outline" className="text-risk-high border-risk-high">
              {activeRiskFactors} factor{activeRiskFactors > 1 ? 'es' : ''} de riesgo
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {riskFactors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <span className="text-sm text-muted-foreground">{factor.label}</span>
              {factor.value ? (
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-risk-high" />
                  <span className="text-sm font-medium text-risk-high">Si</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-risk-low" />
                  <span className="text-sm text-muted-foreground">No</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
