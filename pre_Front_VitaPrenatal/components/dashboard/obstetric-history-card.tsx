"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, CheckCircle2, AlertCircle } from "lucide-react"

interface ObstetricHistory {
  fam_cardiopatia: boolean
  antecedentes_familia_hipertension: boolean
  enf_renal_cronica: boolean
  previousHypertension: boolean
  diabetes: boolean
  abortos_previos: number
  cesarea_previos: number
  embarazos_previos: number
  partos_previos: number
  embarazo_multiple: boolean
  muerte_fetal: boolean
  restriccion_fetal: boolean
}

interface ObstetricHistoryCardProps {
  history: ObstetricHistory
}

export function ObstetricHistoryCard({ history }: ObstetricHistoryCardProps) {
  const binaryRiskFactors = [
    history.fam_cardiopatia,
    history.antecedentes_familia_hipertension,
    history.enf_renal_cronica,
    history.previousHypertension,
    history.diabetes,
    history.embarazo_multiple,
    history.muerte_fetal,
    history.restriccion_fetal,
  ]
  const activeRiskFactors = binaryRiskFactors.filter(Boolean).length

  const renderBoolean = (value: boolean) => {
    if (value) {
      return (
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4 text-risk-high" />
          <span className="text-sm font-medium text-risk-high">Si</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="h-4 w-4 text-risk-low" />
        <span className="text-sm text-muted-foreground">No</span>
      </div>
    )
  }

  const NumberItem = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )

  const BooleanItem = ({ label, value }: { label: string; value: boolean }) => (
    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {renderBoolean(value)}
    </div>
  )

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
        <div className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Heredo-familiares</h4>
            <BooleanItem label="Cardiopatia familiar" value={history.fam_cardiopatia} />
            <BooleanItem
              label="Antecedentes familiares de hipertension"
              value={history.antecedentes_familia_hipertension}
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Personales patologicos</h4>
            <BooleanItem label="Enfermedad renal cronica" value={history.enf_renal_cronica} />
            <BooleanItem label="Hipertension previa" value={history.previousHypertension} />
            <BooleanItem label="Diabetes" value={history.diabetes} />
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Ginecoobstetricos</h4>
            <NumberItem label="Abortos previos" value={history.abortos_previos} />
            <NumberItem label="Cesareas previas" value={history.cesarea_previos} />
            <NumberItem label="Embarazos previos" value={history.embarazos_previos} />
            <NumberItem label="Partos previos" value={history.partos_previos} />
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Otros</h4>
            <BooleanItem label="Embarazo multiple" value={history.embarazo_multiple} />
            <BooleanItem label="Muerte fetal" value={history.muerte_fetal} />
            <BooleanItem label="Restriccion fetal" value={history.restriccion_fetal} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
