"use client"

import { Consultation, RiskLevel } from "@/lib/patient-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ClipboardList, Calendar, Clock, Activity, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConsultationHistoryCardProps {
  consultations: Consultation[]
  selectedConsultationId: string | null
  onSelectConsultation: (consultation: Consultation) => void
  onNewConsultation: () => void
}

const riskConfig: Record<RiskLevel, { label: string; shortLabel: string; bgColor: string; textColor: string }> = {
  none: {
    label: "Ninguno",
    shortLabel: "Ninguno",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
  },
  low: {
    label: "Bajo",
    shortLabel: "Bajo",
    bgColor: "bg-risk-low/15",
    textColor: "text-risk-low",
  },
  moderate: {
    label: "Medio",
    shortLabel: "Medio",
    bgColor: "bg-risk-moderate/15",
    textColor: "text-risk-moderate",
  },
  high: {
    label: "Alto",
    shortLabel: "Alto",
    bgColor: "bg-risk-high/15",
    textColor: "text-risk-high",
  },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function ConsultationHistoryCard({
  consultations,
  selectedConsultationId,
  onSelectConsultation,
  onNewConsultation,
}: ConsultationHistoryCardProps) {
  // Sort consultations by date (most recent first)
  const sortedConsultations = [...consultations].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ClipboardList className="h-4 w-4 text-primary" />
            Historial de Consultas
            <Badge variant="secondary" className="text-xs">
              {consultations.length}
            </Badge>
          </CardTitle>
          <Button size="sm" onClick={onNewConsultation} className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nueva</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2">
            {sortedConsultations.map((consultation, index) => {
              const risk = riskConfig[consultation.riskLevel]
              const isSelected = consultation.id === selectedConsultationId
              const isLatest = index === 0

              return (
                <button
                  key={consultation.id}
                  onClick={() => onSelectConsultation(consultation)}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all",
                    "hover:bg-muted/50 hover:border-primary/30",
                    isSelected
                      ? "bg-primary/5 border-primary/50 ring-1 ring-primary/20"
                      : "bg-card border-border/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(consultation.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{consultation.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isLatest && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-primary/5 text-primary border-primary/30">
                          Reciente
                        </Badge>
                      )}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Sem.</span>
                      <span className="font-medium">S{consultation.gestationalWeek}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">IMC</span>
                      <span className="font-medium">{consultation.bmi.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">P.A.</span>
                      <span className="font-medium">{consultation.systolic}/{consultation.diastolic}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Riesgo</span>
                      <Badge className={cn("w-fit text-xs mt-0.5", risk.bgColor, risk.textColor)}>
                        {risk.shortLabel}
                      </Badge>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
