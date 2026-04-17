"use client"

import { useState, useEffect, useRef } from "react"
import {
  usePatients,
  RiskLevel as ContextRiskLevel,
  Consultation,
  ConsultationCreateInput,
} from "@/lib/patient-context"
import { useConfiguration } from "@/lib/configuration-context"
import { consultaService } from "@/servicios/consultaService"
import { fetchApi } from "@/servicios/apiClient"
import { ApiServiceError, getApiErrorMessage } from "@/servicios/apiError"
import { Consulta as ApiConsulta, PrediccionResponse } from "@/interfaz/consulta"
import { normalizeClinicalRisk, NormalizedRisk } from "@/lib/risk-normalization"
import { MainNav } from "@/components/navigation/main-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PatientInfoCard } from "@/components/dashboard/patient-info-card"
import { ObstetricHistoryCard } from "@/components/dashboard/obstetric-history-card"
import { RiskIndicatorCard } from "@/components/dashboard/risk-indicator-card"
import { VitalSignsChart } from "@/components/dashboard/vital-signs-chart"
import { BloodPressureInputCard } from "@/components/dashboard/blood-pressure-input-card"
import { RecommendationsCard } from "@/components/dashboard/recommendations-card"
import { MedicationRecommendationsCard } from "@/components/dashboard/medication-recommendations-card"
import { PatientNotesCard } from "@/components/dashboard/patient-notes-card"
import { ConsultationHistoryCard } from "@/components/dashboard/consultation-history-card"
import { ReportDownloadCard } from "@/components/dashboard/report-download-card"
import { ConsultationForm } from "@/components/patients/consultation-form"
import { useMedicacion } from "@/hooks/use-medicacion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"
import {
  extractDateTimeInMexico,
  getCurrentMexicoDateTimeLabel,
  getDateTimeSortKey,
} from "@/lib/mexico-time"
import { Users, ArrowRight } from "lucide-react"
import Link from "next/link"

type BackendRisk = NormalizedRisk

function mapContextRiskToBackendRisk(level: ContextRiskLevel): BackendRisk {
  switch (level) {
    case "none":
      return "NINGUNO"
    case "low":
      return "MEDIO"
    case "moderate":
      return "MEDIO"
    case "high":
      return "ALTO"
    case "hospitalization":
      return "HOSPITALIZACION"
    default:
      return "NINGUNO"
  }
}

function mapApiRiskToContextRisk(riesgo: string | undefined): ContextRiskLevel {
  switch (normalizeClinicalRisk(riesgo)) {
    case "MEDIO":
      return "moderate"
    case "ALTO":
      return "high"
    case "HOSPITALIZACION":
      return "hospitalization"
    case "NINGUNO":
    default:
      return "none"
  }
}

function hasInterpretation(interpretacion: string | null | undefined): boolean {
  return typeof interpretacion === "string" && interpretacion.trim().length > 0
}

function buildPredictionFromConsulta(consulta: ApiConsulta, fallbackConsultaId: number): PrediccionResponse | null {
  if (!hasInterpretation(consulta.interpretacion)) {
    return null
  }

  const principalRisk = normalizeClinicalRisk(consulta.riesgo)

  return {
    consulta_id: typeof consulta.id === "number" ? consulta.id : fallbackConsultaId,
    paciente_id: consulta.paciente_id,
    riesgo: principalRisk,
    riesgo_ml: consulta.riesgo_ml ? normalizeClinicalRisk(consulta.riesgo_ml) : principalRisk,
    riesgo_ml_modelo: consulta.riesgo_ml_modelo ?? null,
    confianza_ml: typeof consulta.confianza_ml === "number" ? consulta.confianza_ml : undefined,
    score_total: typeof consulta.score_total === "number" ? consulta.score_total : undefined,
    interpretacion: consulta.interpretacion!.trim(),
  }
}

// Generate BP history data from consultations
function generateBPHistoryFromConsultations(consultations: Consultation[], type: "systolic" | "diastolic") {
  const sorted = [...consultations].sort((a, b) => {
    return getDateTimeSortKey(a.date, a.time).localeCompare(getDateTimeSortKey(b.date, b.time))
  })

  return sorted.map((c) => ({
    week: `S${c.gestationalWeek}`,
    value: type === "systolic" ? c.systolic : c.diastolic,
  }))
}

export default function VitaPrenatalMonitoreoClinico() {
  const { 
    selectedPatient,
    selectedConsultation,
    selectConsultation,
    addConsultation,
    updateConsultation,
  } = usePatients()
  const { fetchNotificaciones, configuraciones } = useConfiguration()
  
  const [systolic, setSystolic] = useState(120)
  const [diastolic, setDiastolic] = useState(80)
  const [systolicData, setSystolicData] = useState<{ week: string; value: number }[]>([])
  const [diastolicData, setDiastolicData] = useState<{ week: string; value: number }[]>([])
  const [showConsultationForm, setShowConsultationForm] = useState(false)
  const [prediction, setPrediction] = useState<PrediccionResponse | null>(null)
  const [predictionErrorMessage, setPredictionErrorMessage] = useState<string | null>(null)
  const [consultationDetails, setConsultationDetails] = useState<ApiConsulta | null>(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [openingPdfConsultationId, setOpeningPdfConsultationId] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(() => getCurrentMexicoDateTimeLabel())
  const latestConsultationRequestId = useRef(0)

  const consultationForMedication = selectedConsultation ?? selectedPatient?.consultations[0] ?? null
  const medicationRiskInput = prediction?.riesgo
    ?? consultationDetails?.riesgo
    ?? (consultationForMedication ? mapContextRiskToBackendRisk(consultationForMedication.riskLevel) : "NINGUNO")

  const {
    data: medicationData,
    loading: medicationLoading,
    error: medicationError,
    invalidRiskMessage: medicationInvalidRiskMessage,
    refetch: refetchMedicacion,
  } = useMedicacion(medicationRiskInput, {
    enabled: Boolean(consultationForMedication),
  })

  const syncConsultationInContext = (consultationId: string, consultationFromApi: ApiConsulta) => {
    if (!selectedPatient) {
      return
    }

    const fallbackDate = consultationFromApi.fecha_hora_consulta.split("T")[0]
    const fallbackRawTime = consultationFromApi.fecha_hora_consulta.split("T")[1] ?? "00:00"
    const mexicoDateTime = extractDateTimeInMexico(consultationFromApi.fecha_hora_consulta)
    const date = mexicoDateTime?.date ?? fallbackDate
    const time = mexicoDateTime?.time ?? fallbackRawTime.slice(0, 5)

    updateConsultation(selectedPatient.id, consultationId, {
      date,
      time,
      gestationalWeek: consultationFromApi.edad_gestacional,
      weight: consultationFromApi.peso,
      height: consultationFromApi.altura,
      bmi: consultationFromApi.imc,
      pam:
        typeof consultationFromApi.pam === "number"
          ? consultationFromApi.pam
          : Number(((consultationFromApi.presion_sistolica + 2 * consultationFromApi.presion_diastolica) / 3).toFixed(1)),
      systolic: consultationFromApi.presion_sistolica,
      diastolic: consultationFromApi.presion_diastolica,
      riskLevel: mapApiRiskToContextRisk(consultationFromApi.riesgo),
    })
  }

  const loadConsultationClinicalData = async (consultationId?: string) => {
    if (!consultationId || !selectedPatient) {
      setConsultationDetails(null)
      setPrediction(null)
      setPredictionErrorMessage(null)
      setPredictionLoading(false)
      return
    }

    const idNumber = Number.parseInt(consultationId, 10)

    if (Number.isNaN(idNumber)) {
      console.warn("⚠️ loadConsultationClinicalData: consultationId invalido", consultationId)
      setPredictionLoading(false)
      return
    }

    const requestId = latestConsultationRequestId.current + 1
    latestConsultationRequestId.current = requestId

    setPredictionLoading(true)
    setPrediction(null)
    setPredictionErrorMessage(null)

    try {
      const consultationFromApi = await consultaService.obtenerPorId(idNumber)

      if (latestConsultationRequestId.current !== requestId) {
        return
      }

      setConsultationDetails(consultationFromApi)
      syncConsultationInContext(consultationId, consultationFromApi)

      const storedPrediction = buildPredictionFromConsulta(consultationFromApi, idNumber)

      if (storedPrediction) {
        setPrediction(storedPrediction)
        setPredictionErrorMessage(null)
        return
      }

      const predictionFromApi = await consultaService.obtenerPrediccion(idNumber)

      if (latestConsultationRequestId.current !== requestId) {
        return
      }

      setPrediction(predictionFromApi)
      setPredictionErrorMessage(null)

      const refreshedConsultation = await consultaService.obtenerPorId(idNumber)

      if (latestConsultationRequestId.current !== requestId) {
        return
      }

      setConsultationDetails(refreshedConsultation)
      syncConsultationInContext(consultationId, refreshedConsultation)
    } catch (error) {
      if (latestConsultationRequestId.current !== requestId) {
        return
      }

      const isNetworkOrServerError =
        !(error instanceof ApiServiceError) ||
        error.status >= 500

      const errorMessage = isNetworkOrServerError
        ? "No fue posible cargar la prediccion clinica."
        : getApiErrorMessage(error)

      setPredictionErrorMessage(`${errorMessage} Reintente manualmente.`)

      toast({
        variant: "destructive",
        title: "Error al cargar consulta",
        description: `${errorMessage} Reintente manualmente.`,
      })
      console.error("Error loading consultation details:", error)
    } finally {
      if (latestConsultationRequestId.current === requestId) {
        setPredictionLoading(false)
      }
    }
  }

  const handleRefresh = async () => {
    if (!consultation?.id) return

    try {
      const response = await fetchApi(`/api/actualizar/${consultation.id}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Error al actualizar consulta: ${response.status} ${response.statusText}`)
      }

      await loadConsultationClinicalData(consultation.id)
      await fetchNotificaciones()
      setLastUpdated(getCurrentMexicoDateTimeLabel())
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar consulta",
        description: getApiErrorMessage(error),
      })
      console.error("Error:", error)
    }
  }

  // Update values when selected consultation changes
  useEffect(() => {
    if (selectedConsultation) {
      setSystolic(selectedConsultation.systolic)
      setDiastolic(selectedConsultation.diastolic)
    }
  }, [selectedConsultation])

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

  const handleNewConsultation = async (consultationData: ConsultationCreateInput) => {
    if (!selectedPatient) {
      throw new Error("Recurso no encontrado")
    }

    try {
      await addConsultation(selectedPatient.id, consultationData)
      await fetchNotificaciones()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al registrar consulta",
        description: getApiErrorMessage(error),
      })
      throw error
    }
  }

  const handleSelectConsultation = (consultation: Consultation) => {
    selectConsultation(consultation)
  }

  const handleGeneratePrediction = async () => {
    if (!consultation?.id) {
      toast({
        variant: "destructive",
        title: "Consulta no seleccionada",
        description: "Seleccione una consulta para generar la prediccion clinica.",
      })
      return
    }

    const interpretationExists =
      hasInterpretation(prediction?.interpretacion) ||
      hasInterpretation(consultationDetails?.interpretacion)

    if (interpretationExists) {
      toast({
        title: "Prediccion existente",
        description: "La consulta ya tiene interpretacion clinica registrada.",
      })
      return
    }

    await loadConsultationClinicalData(consultation.id)
  }

  const handleOpenReportPdf = async (consultationId: string) => {
    const consultaId = Number.parseInt(consultationId, 10)

    if (Number.isNaN(consultaId)) {
      toast({
        variant: "destructive",
        title: "Consulta invalida",
        description: "No se pudo identificar la consulta seleccionada.",
      })
      return
    }

    setOpeningPdfConsultationId(consultationId)

    try {
      const reportUrl = consultaService.obtenerUrlReportePdf(consultaId)
      const opened = window.open(reportUrl, "_blank", "noopener,noreferrer")

      if (!opened) {
        // Fallback when popup opening is blocked by browser settings.
        await consultaService.descargarReportePdf(consultaId)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)

      toast({
        variant: "destructive",
        title: "Error al descargar reporte",
        description: errorMessage,
      })
    } finally {
      setOpeningPdfConsultationId((current) =>
        current === consultationId ? null : current,
      )
    }
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
                Para ver el monitoreo clínico de predicción de riesgo, primero seleccione un paciente desde la lista de pacientes registrados.
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

        <Toaster />
      </div>
    )
  }

  // Get consultation data (use selected or latest)
  const consultation = selectedConsultation || selectedPatient.consultations[0]
  
  // Refresh consultation details when consultation changes.
  useEffect(() => {
    void loadConsultationClinicalData(consultation?.id)
  }, [consultation?.id, selectedPatient?.id])
  
  if (!consultation) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav
          hideUtilityActions
          subHeader={<DashboardHeader lastUpdated={lastUpdated} onRefresh={handleRefresh} />}
        />
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

        <Toaster />
      </div>
    )
  }

  const patientData = {
    name: selectedPatient.name,
    age: selectedPatient.age,
    bloodType: selectedPatient.tipo_sangre,
    gestationalWeek: consultation.gestationalWeek,
    weight: consultation.weight,
    height: consultation.height,
    bmi: consultation.bmi,
  }

  const obstetricHistory = {
    fam_cardiopatia: selectedPatient.fam_cardiopatia,
    antecedentes_familia_hipertension: selectedPatient.familyHypertensionHistory,
    enf_renal_cronica: selectedPatient.enf_renal_cronica,
    previousHypertension: consultation.previousHypertension,
    diabetes: consultation.diabetes,
    abortos_previos: selectedPatient.abortos_previos,
    cesarea_previos: selectedPatient.cesarea_previos,
    embarazos_previos: selectedPatient.embarazos_previos,
    partos_previos: selectedPatient.partos_previos,
    embarazo_multiple: selectedPatient.embarazo_multiple,
    muerte_fetal: selectedPatient.muerte_fetal,
    restriccion_fetal: selectedPatient.restriccion_fetal,
  }

  const backendRisk = mapContextRiskToBackendRisk(consultation.riskLevel)
  const currentRiskData = prediction
    ? {
        riesgo: prediction.riesgo,
        riesgo_ml: prediction.riesgo_ml,
        riesgo_ml_modelo: prediction.riesgo_ml_modelo,
        confianza_ml: prediction.confianza_ml,
        score_total: prediction.score_total,
      }
    : {
        riesgo: normalizeClinicalRisk(consultationDetails?.riesgo || backendRisk),
        riesgo_ml: consultationDetails?.riesgo_ml
          ? normalizeClinicalRisk(consultationDetails.riesgo_ml)
          : undefined,
        riesgo_ml_modelo: consultationDetails?.riesgo_ml_modelo ?? undefined,
        confianza_ml: consultationDetails?.confianza_ml ?? undefined,
        score_total: consultationDetails?.score_total ?? undefined,
      }

  const clinicalInterpretation = hasInterpretation(prediction?.interpretacion)
    ? prediction?.interpretacion
    : hasInterpretation(consultationDetails?.interpretacion)
      ? consultationDetails?.interpretacion
      : null

  const reportIsAvailable = hasInterpretation(clinicalInterpretation)
  const canGeneratePrediction = !!consultation.id && !reportIsAvailable

  return (
    <div className="min-h-screen bg-background">
      <MainNav
        hideUtilityActions
        subHeader={<DashboardHeader lastUpdated={lastUpdated} onRefresh={handleRefresh} />}
      />
      
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
              onDownloadConsultationReport={handleOpenReportPdf}
              downloadingConsultationId={openingPdfConsultationId}
            />
          </div>

          {/* Center Column - Risk Indicator, BP Input, and Charts */}
          <div className="md:col-span-1 xl:col-span-5 space-y-6">
            <RiskIndicatorCard
              data={currentRiskData}
              isLoading={predictionLoading}
              errorMessage={predictionErrorMessage}
              onRetry={consultation?.id ? () => void loadConsultationClinicalData(consultation.id) : undefined}
            />
            
            <BloodPressureInputCard
              systolic={systolic}
              diastolic={diastolic}
              onSystolicChange={handleSystolicChange}
              onDiastolicChange={handleDiastolicChange}
              hypertensionSystolicThreshold={configuraciones.umbralSistolico}
              hypertensionDiastolicThreshold={configuraciones.umbralDiastolico}
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

            <ReportDownloadCard
              consultationId={consultation.id}
              isAvailable={reportIsAvailable}
              onDownloadReport={handleOpenReportPdf}
              downloadingConsultationId={openingPdfConsultationId}
            />
          </div>

          {/* Right Column - Recommendations and Medication */}
          <div className="md:col-span-2 xl:col-span-4 space-y-6">
            <RecommendationsCard 
              riesgo={currentRiskData.riesgo}
              interpretation={clinicalInterpretation}
              isLoadingInterpretation={predictionLoading && !clinicalInterpretation}
              onGeneratePrediction={handleGeneratePrediction}
              canGeneratePrediction={canGeneratePrediction}
            />

            <MedicationRecommendationsCard
              loading={medicationLoading}
              error={medicationError}
              invalidRiskMessage={medicationInvalidRiskMessage}
              data={medicationData}
              onRetry={() => {
                void refetchMedicacion()
              }}
            />
          </div>

          {/* Bottom Row - Full Width Notes */}
          <div className="md:col-span-2 xl:col-span-12">
            <PatientNotesCard
              consultationId={consultation.id}
              patientId={consultationDetails?.paciente_id || null}
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

      <Toaster />
    </div>
  )
}

export const dynamic = 'force-dynamic'
