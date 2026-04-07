"use client"

import { useState, useEffect } from "react"
import { usePatients, RiskLevel as ContextRiskLevel, Consultation } from "@/lib/patient-context"
import { consultaService } from "@/servicios/consultaService"
import { PrediccionResponse } from "@/interfaz/consulta"
import { MainNav } from "@/components/navigation/main-nav"
import { PatientInfoCard } from "@/components/dashboard/patient-info-card"
import { ObstetricHistoryCard } from "@/components/dashboard/obstetric-history-card"
import { RiskIndicatorCard } from "@/components/dashboard/risk-indicator-card"
import { VitalSignsChart } from "@/components/dashboard/vital-signs-chart"
import { BloodPressureInputCard } from "@/components/dashboard/blood-pressure-input-card"
import { RecommendationsCard } from "@/components/dashboard/recommendations-card"
import { PatientNotesCard } from "@/components/dashboard/patient-notes-card"
import { ConsultationHistoryCard } from "@/components/dashboard/consultation-history-card"
import { ConsultationForm } from "@/components/patients/consultation-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ArrowRight } from "lucide-react"
import Link from "next/link"

// Map context risk level to dashboard risk level
type DashboardRiskLevel = "low" | "moderate" | "high" | "very-high"

function mapRiskLevel(level: ContextRiskLevel): DashboardRiskLevel {
  switch (level) {
    case "none":
      return "low"
    case "low":
      return "low"
    case "moderate":
      return "moderate"
    case "high":
      return "high"
    default:
      return "low"
  }
}

// Generate BP history data from consultations
function generateBPHistoryFromConsultations(consultations: Consultation[], type: "systolic" | "diastolic") {
  const sorted = [...consultations].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA.getTime() - dateB.getTime()
  })

  return sorted.map((c) => ({
    week: `S${c.gestationalWeek}`,
    value: type === "systolic" ? c.systolic : c.diastolic,
  }))
}

export default function VitaPrenatalDashboard() {
  const { 
    selectedPatient, 
    selectedConsultation, 
    selectConsultation, 
    addConsultation,
    updateConsultation
  } = usePatients()
  
  const [systolic, setSystolic] = useState(120)
  const [diastolic, setDiastolic] = useState(80)
  const [systolicData, setSystolicData] = useState<{ week: string; value: number }[]>([])
  const [diastolicData, setDiastolicData] = useState<{ week: string; value: number }[]>([])
  const [showConsultationForm, setShowConsultationForm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [prediction, setPrediction] = useState<PrediccionResponse | null>(null)

  // Update values when selected consultation changes
  useEffect(() => {
    if (selectedConsultation) {
      setSystolic(selectedConsultation.systolic)
      setDiastolic(selectedConsultation.diastolic)
    }
  }, [selectedConsultation])

  // Set mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update chart data when patient changes
  useEffect(() => {
    if (selectedPatient && selectedPatient.consultations.length > 0) {
      setSystolicData(generateBPHistoryFromConsultations(selectedPatient.consultations, "systolic"))
      setDiastolicData(generateBPHistoryFromConsultations(selectedPatient.consultations, "diastolic"))
    } else {
      setSystolicData([])
      setDiastolicData([])
    }
  }, [selectedPatient])

  // Update consultation when BP values change
  const handleSystolicChange = (value: number) => {
    setSystolic(value)
    if (selectedPatient && selectedConsultation) {
      updateConsultation(selectedPatient.id, selectedConsultation.id, { systolic: value })
    }
  }

  const handleDiastolicChange = (value: number) => {
    setDiastolic(value)
    if (selectedPatient && selectedConsultation) {
      updateConsultation(selectedPatient.id, selectedConsultation.id, { diastolic: value })
    }
  }

  const handleSaveNotes = (notes: string) => {
    if (selectedPatient && selectedConsultation) {
      updateConsultation(selectedPatient.id, selectedConsultation.id, { notes })
    }
  }

  const handleNewConsultation = (consultationData: Omit<Consultation, "id" | "bmi" | "riskLevel" | "riskProbability">) => {
    if (selectedPatient) {
      addConsultation(selectedPatient.id, consultationData)
    }
  }

  const handleSelectConsultation = (consultation: Consultation) => {
    selectConsultation(consultation)
  }

  // Show empty state if no patient selected
  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        
        <main className="container mx-auto px-4 py-6">
          <Card className="border-border/50 max-w-lg mx-auto mt-12">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Seleccione un Paciente
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Para ver el dashboard de prediccion de riesgo, primero seleccione un paciente desde la lista de pacientes registrados.
              </p>
              <Link href="/pacientes">
                <Button className="gap-2">
                  Ir a Pacientes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 mt-8 py-4 bg-card/50 fixed bottom-0 left-0 right-0">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
              <p className="font-medium">VitaPrenatal</p>
              <p className="text-xs max-w-md">
                Sistema de apoyo clinico. No sustituye el juicio medico profesional.
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // Get consultation data (use selected or latest)
  const consultation = selectedConsultation || selectedPatient.consultations[0]
  
  // Fetch prediction when consultation changes
  useEffect(() => {
    const fetchPrediction = async () => {
      if (consultation?.id) {
        const idNumber = parseInt(consultation.id, 10);
        console.log("🔎 fetchPrediction -> consultation.id:", consultation.id, "parsed:", idNumber);

        try {
          const pred = await consultaService.obtenerPrediccion(idNumber);
          console.log("🎯 PREDICCIÓN OBTENIDA raw:", pred);

          if (!pred) {
            console.warn("⚠️ fetchPrediction: la API devolvió null o vacío para la predicción", { idNumber });
            setPrediction(null);
            return;
          }

          console.log("🎯 PREDICCIÓN OBTENIDA fields:", {
            consulta_id: pred.consulta_id,
            riesgo: pred.riesgo,
            riesgo_ml: pred.riesgo_ml,
            confianza_ml: pred.confianza_ml,
            score_total: pred.score_total,
            interpretacion: pred.interpretacion,
            datos_consulta: pred.datos_consulta,
          });
          setPrediction(pred);
        } catch (error) {
          console.error("Error fetching prediction:", error);
          setPrediction(null);
        }
      } else {
        console.warn("⚠️ fetchPrediction no se ejecutó porque consultation.id no está definido", consultation);
      }
    };
    fetchPrediction();
  }, [consultation?.id]);
  
  if (!consultation) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-6">
          <Card className="border-border/50 max-w-lg mx-auto mt-12">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Sin consultas registradas
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Este paciente no tiene consultas. Agregue una nueva consulta para continuar.
              </p>
              <Button onClick={() => setShowConsultationForm(true)}>
                Nueva Consulta
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <ConsultationForm
          open={showConsultationForm}
          onClose={() => setShowConsultationForm(false)}
          patient={selectedPatient}
          onSave={handleNewConsultation}
        />
      </div>
    )
  }

  const patientData = {
    name: selectedPatient.name,
    age: selectedPatient.age,
    gestationalWeek: consultation.gestationalWeek,
    weight: consultation.weight,
    height: consultation.height,
    bmi: consultation.bmi,
  }

  const obstetricHistory = {
    previousHypertension: consultation.previousHypertension,
    diabetes: consultation.diabetes,
    familyHypertensionHistory: consultation.familyHypertensionHistory,
  }

  const riskLevel = mapRiskLevel(consultation.riskLevel)

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-6 overflow-x-hidden">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-12">
          {/* Left Column - Patient Info, History, Consultations */}
          <div className="md:col-span-1 xl:col-span-3 space-y-6">
            <PatientInfoCard patient={patientData} />
            <ObstetricHistoryCard history={obstetricHistory} />
            <ConsultationHistoryCard
              consultations={selectedPatient.consultations}
              selectedConsultationId={selectedConsultation?.id || null}
              onSelectConsultation={handleSelectConsultation}
              onNewConsultation={() => setShowConsultationForm(true)}
            />
          </div>

          {/* Center Column - Risk Indicator, BP Input, and Charts */}
          <div className="md:col-span-1 xl:col-span-5 space-y-6">
            <RiskIndicatorCard 
              data={prediction ? {
                riesgo: prediction.riesgo,
                riesgo_ml: prediction.riesgo_ml,
                confianza_ml: prediction.confianza_ml,
                score_total: prediction.score_total
              } : {
                riesgo: "BAJO",
                riesgo_ml: "BAJO",
                confianza_ml: 0,
                score_total: 0
              }}
            />
            
            <BloodPressureInputCard
              systolic={systolic}
              diastolic={diastolic}
              onSystolicChange={handleSystolicChange}
              onDiastolicChange={handleDiastolicChange}
            />
            
            {/* Blood Pressure Charts */}
            <div className="space-y-4">
              <VitalSignsChart
                title="P.A. Sistolica"
                data={systolicData}
                unit="mmHg"
                normalMin={90}
                normalMax={120}
                currentValue={systolic}
                icon="bp"
                color="oklch(0.65 0.15 320)"
              />
              <VitalSignsChart
                title="P.A. Diastolica"
                data={diastolicData}
                unit="mmHg"
                normalMin={60}
                normalMax={80}
                currentValue={diastolic}
                icon="bp"
                color="oklch(0.70 0.12 340)"
              />
            </div>
          </div>

          {/* Right Column - Recommendations and Notes */}
          <div className="md:col-span-2 xl:col-span-4 space-y-6">
            <RecommendationsCard 
              riskLevel={riskLevel} 
              consultationId={consultation?.id}
              mlData={prediction ? {
                riesgo: prediction.riesgo,
                riesgo_ml: prediction.riesgo_ml,
                confianza_ml: prediction.confianza_ml,
                score_total: prediction.score_total
              } : undefined}
            />
            <PatientNotesCard 
              onSave={handleSaveNotes} 
              initialNotes={selectedConsultation?.notes || ""}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-8 py-4 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <p className="font-medium">VitaPrenatal</p>
            <p className="text-xs max-w-md">
              Sistema de apoyo clinico. No sustituye el juicio medico profesional.
            </p>
          </div>
        </div>
      </footer>

      {/* New Consultation Dialog */}
      <ConsultationForm
        open={showConsultationForm}
        onClose={() => setShowConsultationForm(false)}
        patient={selectedPatient}
        onSave={handleNewConsultation}
      />
    </div>
  )
}

export const dynamic = 'force-dynamic'
