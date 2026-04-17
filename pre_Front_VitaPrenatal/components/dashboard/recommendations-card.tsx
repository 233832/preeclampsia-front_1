"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  Calendar, 
  Stethoscope, 
  Activity, 
  HeartPulse,
  Info,
  Salad,
  BedDouble,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { normalizeClinicalRisk } from "@/lib/risk-normalization"

type BackendRisk = "NINGUNO" | "BAJO" | "MEDIO" | "ALTO" | "HOSPITALIZACION"

interface RecommendationsCardProps {
  riesgo: string
  interpretation?: string | null
  isLoadingInterpretation?: boolean
  onGeneratePrediction?: () => void
  canGeneratePrediction?: boolean
}

const recommendationsByRisk = {
  NINGUNO: [
    {
      icon: Activity,
      title: "Monitoreo de presion arterial",
      description: "Medir la presion arterial en cada visita prenatal de rutina.",
    },
    {
      icon: Calendar,
      title: "Frecuencia de chequeo",
      description: "Mantener control prenatal cada 4 semanas (28 dias).",
    },
    {
      icon: Salad,
      title: "Estilo de vida saludable",
      description: "Mantener alimentacion balanceada y actividad fisica moderada.",
    },
    {
      icon: Stethoscope,
      title: "Vigilancia de sintomas",
      description: "Consultar antes de la cita si aparecen cefalea intensa, edema brusco o vision borrosa.",
    },
  ],
  BAJO: [
    {
      icon: HeartPulse,
      title: "Monitoreo ambulatorio",
      description: "Medir presion arterial 2 a 3 veces por semana y registrar resultados.",
    },
    {
      icon: Calendar,
      title: "Frecuencia de chequeo",
      description: "Programar consultas de seguimiento cada 2 semanas (14 dias).",
    },
    {
      icon: Salad,
      title: "Prevencion activa",
      description: "Reducir sal, asegurar hidratacion y mantener reposo nocturno adecuado.",
    },
    {
      icon: Stethoscope,
      title: "Reevaluacion clinica",
      description: "Adelantar valoracion si la presion sube o aparecen sintomas de alarma.",
    },
  ],
  MEDIO: [
    {
      icon: HeartPulse,
      title: "Monitoreo diario",
      description: "Medir presion arterial todos los dias y registrar al menos 2 tomas.",
    },
    {
      icon: Calendar,
      title: "Frecuencia de chequeo",
      description: "Programar control clinico semanal (cada 7 dias).",
    },
    {
      icon: Stethoscope,
      title: "Seguimiento especializado",
      description: "Coordinar valoracion por medicina materno-fetal en consulta prioritaria.",
    },
    {
      icon: Activity,
      title: "Vigilancia de alarma",
      description: "Si presenta cefalea intensa, fosfenos, dolor epigastrico o edema brusco, acudir de inmediato.",
    },
  ],
  ALTO: [
    {
      icon: HeartPulse,
      title: "Monitoreo estrecho",
      description: "Medir presion arterial minimo 2 veces al dia, con bitacora de sintomas.",
    },
    {
      icon: Calendar,
      title: "Frecuencia de chequeo",
      description: "Control presencial cada 7 dias como maximo, o antes si hay empeoramiento.",
    },
    {
      icon: Stethoscope,
      title: "Evaluacion prioritaria",
      description: "Seguimiento por especialista en medicina materno-fetal y ajuste de plan terapeutico.",
    },
    {
      icon: BedDouble,
      title: "Plan de contingencia",
      description: "Definir criterios de referencia a urgencias y posible hospitalizacion segun evolucion.",
    },
  ],
  HOSPITALIZACION: [
    {
      icon: BedDouble,
      title: "Hospitalizacion urgente",
      description: "Ingresar de inmediato para vigilancia materna y fetal continua.",
    },
    {
      icon: HeartPulse,
      title: "Monitoreo intrahospitalario",
      description: "Control de presion arterial y signos vitales cada 4 a 6 horas o segun protocolo.",
    },
    {
      icon: Calendar,
      title: "Frecuencia de reevaluacion",
      description: "Reevaluacion clinica por el equipo tratante al menos 1 vez por turno.",
    },
    {
      icon: Stethoscope,
      title: "Plan obstetrico inmediato",
      description: "Definir conducta terapeutica y momento de resolucion obstetrica segun estabilidad clinica.",
    },
  ],
}

const riskStyles = {
  NINGUNO: {
    badge: "bg-muted/30 text-muted-foreground border-muted",
    iconBg: "bg-muted/20",
    iconColor: "text-muted-foreground",
  },
  BAJO: {
    badge: "bg-risk-low/10 text-risk-low border-risk-low",
    iconBg: "bg-risk-low/10",
    iconColor: "text-risk-low",
  },
  MEDIO: {
    badge: "bg-risk-moderate/10 text-risk-moderate border-risk-moderate",
    iconBg: "bg-risk-moderate/10",
    iconColor: "text-risk-moderate",
  },
  ALTO: {
    badge: "bg-risk-high/15 text-risk-high border-risk-high",
    iconBg: "bg-risk-high/15",
    iconColor: "text-risk-high",
  },
  HOSPITALIZACION: {
    badge: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/25 dark:text-red-300 dark:border-red-700",
    iconBg: "bg-red-100 dark:bg-red-900/25",
    iconColor: "text-red-700 dark:text-red-300",
  },
}

const riskLabels = {
  NINGUNO: "Ninguno",
  BAJO: "Bajo",
  MEDIO: "Medio",
  ALTO: "Alto",
  HOSPITALIZACION: "Hospitalizacion urgente",
}

const normalizeBackendRisk = (riesgo: string): BackendRisk => {
  const rawRisk = (riesgo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()

  if (rawRisk === "BAJO") {
    return "BAJO"
  }

  switch (normalizeClinicalRisk(rawRisk)) {
    case "HOSPITALIZACION":
      return "HOSPITALIZACION"
    case "ALTO":
      return "ALTO"
    case "MEDIO":
      return "MEDIO"
    case "NINGUNO":
    default:
      return "NINGUNO"
  }
}

export function RecommendationsCard({
  riesgo,
  interpretation,
  isLoadingInterpretation = false,
  onGeneratePrediction,
  canGeneratePrediction = false,
}: RecommendationsCardProps) {
  const currentRisk = normalizeBackendRisk(riesgo)

  const recommendations = recommendationsByRisk[currentRisk]
  const styles = riskStyles[currentRisk]

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold flex-wrap">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            <span>Recomendaciones</span>
          </CardTitle>
          <Badge variant="outline" className={cn("text-xs flex-shrink-0", styles.badge)}>
            {riskLabels[currentRisk]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Sugerencias segun nivel de riesgo clinico</p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={onGeneratePrediction}
          disabled={!canGeneratePrediction || isLoadingInterpretation}
        >
          {isLoadingInterpretation
            ? "Generando analisis clinico..."
            : canGeneratePrediction
              ? "Prediccion Consulta"
              : "Prediccion ya generada"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingInterpretation && (
          <div className="mb-4 rounded-lg border border-primary/25 bg-primary/5 p-3">
            <p className="text-sm text-primary animate-pulse">Generando analisis clinico...</p>
          </div>
        )}

        {interpretation && !isLoadingInterpretation && (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs text-primary font-semibold mb-1">Interpretacion clinica</p>
              <div className="text-sm text-foreground leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {interpretation}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mt-4">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon
            return (
              <div key={index} className="flex gap-3">
                <div className={cn("p-2 rounded-lg h-fit", styles.iconBg)}>
                  <Icon className={cn("h-4 w-4", styles.iconColor)} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{rec.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-foreground">Aviso Importante</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Este sistema es una <strong className="text-foreground">herramienta de apoyo clinico</strong> y{" "}
                <strong className="text-foreground">no realiza diagnosticos</strong>. 
                Las recomendaciones deben ser evaluadas por el equipo medico tratante.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
