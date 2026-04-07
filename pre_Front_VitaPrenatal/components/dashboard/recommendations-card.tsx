"use client"

import { useState } from "react"
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
  Bot
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PrediccionResponse } from "@/interfaz/consulta"
import { consultaService } from "@/servicios/consultaService"

type RiskLevel = "low" | "moderate" | "high" | "very-high"

interface RecommendationsCardProps {
  riskLevel: RiskLevel
  consultationId?: string
  mlData?: {
    riesgo: string;
    riesgo_ml: string;
    confianza_ml: number;
    score_total: number;
  }
}

const recommendationsByRisk = {
  low: [
    {
      icon: Activity,
      title: "Monitoreo de presion arterial",
      description: "Medir la presion arterial en cada visita prenatal de rutina.",
    },
    {
      icon: Calendar,
      title: "Frecuencia de consultas",
      description: "Mantener citas prenatales regulares cada 4 semanas.",
    },
    {
      icon: Salad,
      title: "Estilo de vida saludable",
      description: "Mantener alimentacion balanceada y actividad fisica moderada.",
    },
  ],
  moderate: [
    {
      icon: HeartPulse,
      title: "Monitoreo intensificado",
      description: "Medir presion arterial semanalmente. Considerar automonitoreo en casa.",
    },
    {
      icon: Stethoscope,
      title: "Consultas mas frecuentes",
      description: "Programar visitas prenatales cada 2 semanas para seguimiento.",
    },
    {
      icon: Salad,
      title: "Cambios en estilo de vida",
      description: "Reducir consumo de sal, aumentar actividad fisica suave y descanso adecuado.",
    },
    {
      icon: BedDouble,
      title: "Seguimiento medico",
      description: "Reportar cualquier sintoma inusual: dolor de cabeza, vision borrosa.",
    },
  ],
  high: [
    {
      icon: HeartPulse,
      title: "Monitoreo diario de presion",
      description: "Medir presion arterial diariamente y registrar valores.",
    },
    {
      icon: Stethoscope,
      title: "Seguimiento especializado",
      description: "Derivar a especialista en medicina materno-fetal de forma prioritaria.",
    },
    {
      icon: Activity,
      title: "Vigilancia de sintomas",
      description: "Estar alerta a sintomas de alarma: cefalea intensa, alteraciones visuales, dolor epigastrico.",
    },
    {
      icon: Calendar,
      title: "Consultas semanales",
      description: "Programar evaluaciones semanales con el equipo medico.",
    },
  ],
  "very-high": [
    {
      icon: HeartPulse,
      title: "Monitoreo continuo",
      description: "Monitoreo hospitalario de presion arterial y bienestar fetal.",
    },
    {
      icon: Stethoscope,
      title: "Evaluacion urgente",
      description: "Evaluacion inmediata por especialista en medicina materno-fetal.",
    },
    {
      icon: Activity,
      title: "Hospitalizacion recomendada",
      description: "Considerar hospitalizacion para vigilancia continua.",
    },
    {
      icon: Calendar,
      title: "Planificacion del parto",
      description: "Evaluar adelanto del parto segun condicion clinica.",
    },
  ],
}

const riskStyles = {
  low: {
    badge: "bg-risk-low/10 text-risk-low border-risk-low",
    iconBg: "bg-risk-low/10",
    iconColor: "text-risk-low",
  },
  moderate: {
    badge: "bg-risk-moderate/10 text-risk-moderate border-risk-moderate",
    iconBg: "bg-risk-moderate/10",
    iconColor: "text-risk-moderate",
  },
  high: {
    badge: "bg-risk-high/10 text-risk-high border-risk-high",
    iconBg: "bg-risk-high/10",
    iconColor: "text-risk-high",
  },
  "very-high": {
    badge: "bg-risk-high/15 text-risk-high border-risk-high",
    iconBg: "bg-risk-high/15",
    iconColor: "text-risk-high",
  },
}

const riskLabels = {
  low: "Bajo",
  moderate: "Medio",
  high: "Alto",
  "very-high": "Muy Alto",
}

const getRiskLevelFromML = (riesgo: string): RiskLevel => {
  switch (riesgo.toLowerCase()) {
    case 'bajo': return 'low';
    case 'medio': return 'moderate';
    case 'alto': return 'high';
    default: return 'low';
  }
};

export function RecommendationsCard({ riskLevel, consultationId, mlData }: RecommendationsCardProps) {
  const [prediction, setPrediction] = useState<PrediccionResponse | null>(null)
  const [loading, setLoading] = useState(false)

  // Use ML data if available, otherwise use the provided riskLevel
  const currentRiskLevel = mlData ? getRiskLevelFromML(mlData.riesgo) : riskLevel

  const handleGenerateAI = async () => {
    if (!consultationId) return

    setLoading(true)
    try {
      const pred = await consultaService.obtenerPrediccion(parseInt(consultationId))
      setPrediction(pred)
    } catch (error) {
      console.error('Error fetching prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  const recommendations = recommendationsByRisk[currentRiskLevel]
  const styles = riskStyles[currentRiskLevel]

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold flex-wrap">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            <span>Recomendaciones</span>
            <Badge variant="secondary" className="text-xs font-normal gap-1">
              <Sparkles className="h-3 w-3" />
              IA
            </Badge>
          </CardTitle>
          <Badge variant="outline" className={cn("text-xs flex-shrink-0", styles.badge)}>
            {riskLabels[currentRiskLevel]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Generado por IA (Gemini)
        </p>
      </CardHeader>
      <CardContent>
        {prediction ? (
          <div className="space-y-4">
            <div className="text-sm text-foreground leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
              {prediction.interpretacion}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPrediction(null)}
              className="w-full"
            >
              <Bot className="h-4 w-4 mr-2" />
              Ocultar Análisis IA
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
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
            
            {consultationId && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleGenerateAI} 
                  disabled={loading}
                  className="w-full gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                      Generar Análisis con IA
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Obtén recomendaciones personalizadas con Gemini AI
                </p>
              </div>
            )}
          </div>
        )}

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
