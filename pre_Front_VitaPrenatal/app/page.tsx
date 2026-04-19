"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  usePatients,
  RiskLevel as ContextRiskLevel,
  Consultation,
  ConsultationCreateInput,
} from "@/lib/patient-context"
import { useConfiguration } from "@/lib/configuration-context"
import { consultaService } from "@/servicios/consultaService"
import { ApiServiceError, getApiErrorMessage } from "@/servicios/apiError"
import { ConsultaDetail, PrediccionInterpretacionResponse } from "@/interfaz/consulta"
import { normalizeClinicalRisk, NormalizedRisk } from "@/lib/risk-normalization"
import {
  ConfiguracionesPayload,
  getConfiguraciones as getBackendConfiguraciones,
} from "@/services/configuracionService"
import { MainNav } from "@/components/navigation/main-nav"
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
  formatDateTimeInMexico,
  getDateTimeSortKey,
} from "@/lib/mexico-time"
import { CalendarClock } from "lucide-react"

type BackendRisk = NormalizedRisk

const FOLLOW_UP_NONE_KEYS = [
  "frecuencia_ninguno",
  "seguimiento_riesgo_ninguno_dias",
  "seguimiento_ninguno_dias",
  "riesgo_ninguno_dias",
  "dias_riesgo_ninguno",
  "seguimiento_riesgo_bajo_dias",
  "seguimiento_bajo_dias",
  "riesgo_bajo_dias",
  "dias_riesgo_bajo",
] as const

const FOLLOW_UP_MEDIUM_KEYS = [
  "frecuencia_medio",
  "seguimiento_riesgo_medio_dias",
  "seguimiento_medio_dias",
  "riesgo_medio_dias",
  "dias_riesgo_medio",
] as const

const FOLLOW_UP_HIGH_KEYS = [
  "frecuencia_alto",
  "seguimiento_riesgo_alto_dias",
  "seguimiento_alto_dias",
  "riesgo_alto_dias",
  "dias_riesgo_alto",
] as const

const DEFAULT_FOLLOW_UP_DAYS = {
  NINGUNO: 30,
  MEDIO: 14,
  ALTO: 7,
} as const

type FollowUpByRisk = {
  NINGUNO: number
  MEDIO: number
  ALTO: number
}

const riskLabelByNormalizedRisk: Record<NormalizedRisk, string> = {
  NINGUNO: "Ninguno",
  MEDIO: "Medio",
  ALTO: "Alto",
  HOSPITALIZACION: "Hospitalizacion",
}

function readFollowUpDays(
  source: Record<string, unknown>,
  aliases: readonly string[],
  fallback: number,
): number {
  for (const key of aliases) {
    const rawValue = source[key]
    const parsed = typeof rawValue === "number" ? rawValue : Number(rawValue)

    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.round(parsed)
    }
  }

  return fallback
}

function resolveFollowUpByRisk(config: ConfiguracionesPayload | null): FollowUpByRisk {
  const source = (config ?? {}) as Record<string, unknown>

  return {
    NINGUNO: readFollowUpDays(source, FOLLOW_UP_NONE_KEYS, DEFAULT_FOLLOW_UP_DAYS.NINGUNO),
    MEDIO: readFollowUpDays(source, FOLLOW_UP_MEDIUM_KEYS, DEFAULT_FOLLOW_UP_DAYS.MEDIO),
    ALTO: readFollowUpDays(source, FOLLOW_UP_HIGH_KEYS, DEFAULT_FOLLOW_UP_DAYS.ALTO),
  }
}

function getFollowUpDaysForRisk(riesgo: NormalizedRisk, followUpByRisk: FollowUpByRisk): number {
  switch (riesgo) {
    case "ALTO":
    case "HOSPITALIZACION":
      return followUpByRisk.ALTO
    case "MEDIO":
      return followUpByRisk.MEDIO
    case "NINGUNO":
    default:
      return followUpByRisk.NINGUNO
  }
}

function buildUtcDateFromConsultation(consultation: Consultation): Date | null {
  const dateMatch = consultation.date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!dateMatch) {
    return null
  }

  const timeMatch = consultation.time.trim().match(/^(\d{2}):(\d{2})$/)
  const year = Number.parseInt(dateMatch[1], 10)
  const month = Number.parseInt(dateMatch[2], 10)
  const day = Number.parseInt(dateMatch[3], 10)
  const hours = timeMatch ? Number.parseInt(timeMatch[1], 10) : 0
  const minutes = timeMatch ? Number.parseInt(timeMatch[2], 10) : 0

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null
  }

  return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
}

function calculateNextAppointmentDate(consultation: Consultation, followUpDays: number): Date | null {
  const baseDate = buildUtcDateFromConsultation(consultation)
  if (!baseDate) {
    return null
  }

  const nextDate = new Date(baseDate)
  nextDate.setUTCDate(nextDate.getUTCDate() + followUpDays)
  return nextDate
}

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
  const router = useRouter()
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
  const [consultationDetails, setConsultationDetails] = useState<ConsultaDetail | null>(null)
  const [consultationLoading, setConsultationLoading] = useState(false)
  const [consultationErrorMessage, setConsultationErrorMessage] = useState<string | null>(null)
  const [reinterpretationLoading, setReinterpretationLoading] = useState(false)
  const [reinterpretationErrorMessage, setReinterpretationErrorMessage] = useState<string | null>(null)
  const [manualInterpretation, setManualInterpretation] = useState<PrediccionInterpretacionResponse | null>(null)
  const [followUpConfig, setFollowUpConfig] = useState<ConfiguracionesPayload | null>(null)
  const [followUpConfigError, setFollowUpConfigError] = useState<string | null>(null)
  const [openingPdfConsultationId, setOpeningPdfConsultationId] = useState<string | null>(null)
  const latestConsultationRequestId = useRef(0)
  const latestReinterpretationRequestId = useRef(0)

  const consultationForMedication = selectedConsultation ?? selectedPatient?.consultations[0] ?? null
  const medicationRiskInput = consultationDetails?.riesgo
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

  const syncConsultationInContext = (consultationId: string, consultationFromApi: ConsultaDetail) => {
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
      setManualInterpretation(null)
      setConsultationErrorMessage(null)
      setConsultationLoading(false)
      setReinterpretationErrorMessage(null)
      setReinterpretationLoading(false)
      return
    }

    const idNumber = Number.parseInt(consultationId, 10)

    if (Number.isNaN(idNumber)) {
      console.warn("⚠️ loadConsultationClinicalData: consultationId invalido", consultationId)
      setConsultationDetails(null)
      setConsultationLoading(false)
      setConsultationErrorMessage("No se pudo identificar la consulta seleccionada.")
      return
    }

    const requestId = latestConsultationRequestId.current + 1
    latestConsultationRequestId.current = requestId

    setConsultationLoading(true)
    setConsultationErrorMessage(null)

    try {
      const consultationFromApi = await consultaService.obtenerPorId(idNumber)

      if (latestConsultationRequestId.current !== requestId) {
        return
      }

      setConsultationDetails(consultationFromApi)
      syncConsultationInContext(consultationId, consultationFromApi)
    } catch (error) {
      if (latestConsultationRequestId.current !== requestId) {
        return
      }

      const isNetworkOrServerError =
        !(error instanceof ApiServiceError) ||
        error.status >= 500

      const fallbackErrorMessage = "No fue posible cargar los datos clinicos de la consulta."

      const errorMessage = isNetworkOrServerError
        ? fallbackErrorMessage
        : getApiErrorMessage(error)

      setConsultationErrorMessage(errorMessage)

      toast({
        variant: "destructive",
        title: "Error al cargar consulta",
        description: errorMessage,
      })
      console.error("Error loading consultation details:", error)
    } finally {
      if (latestConsultationRequestId.current === requestId) {
        setConsultationLoading(false)
      }
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
        description: "Seleccione una consulta para regenerar la interpretacion clinica.",
      })
      return
    }

    const idNumber = Number.parseInt(consultation.id, 10)

    if (Number.isNaN(idNumber)) {
      toast({
        variant: "destructive",
        title: "Consulta invalida",
        description: "No se pudo identificar la consulta seleccionada.",
      })
      return
    }

    const requestId = latestReinterpretationRequestId.current + 1
    latestReinterpretationRequestId.current = requestId

    setReinterpretationLoading(true)
    setReinterpretationErrorMessage(null)

    try {
      const interpretationResponse = await consultaService.obtenerPrediccion(idNumber)

      if (latestReinterpretationRequestId.current !== requestId) {
        return
      }

      setManualInterpretation(interpretationResponse)
    } catch (error) {
      if (latestReinterpretationRequestId.current !== requestId) {
        return
      }

      const isNetworkOrServerError =
        !(error instanceof ApiServiceError) ||
        error.status >= 500

      const fallbackErrorMessage = "No fue posible regenerar la interpretacion clinica."
      const errorMessage = isNetworkOrServerError
        ? fallbackErrorMessage
        : getApiErrorMessage(error)

      setReinterpretationErrorMessage(errorMessage)

      toast({
        variant: "destructive",
        title: "Error al regenerar interpretacion",
        description: errorMessage,
      })
      console.error("Error regenerating interpretation:", error)
    } finally {
      if (latestReinterpretationRequestId.current === requestId) {
        setReinterpretationLoading(false)
      }
    }
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

  useEffect(() => {
    if (!selectedPatient) {
      router.replace("/pacientes")
    }
  }, [selectedPatient, router])

  useEffect(() => {
    let isMounted = true

    const loadFollowUpConfig = async () => {
      try {
        const backendConfig = await getBackendConfiguraciones()

        if (!isMounted) {
          return
        }

        setFollowUpConfig(backendConfig)
        setFollowUpConfigError(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setFollowUpConfigError(getApiErrorMessage(error))
      }
    }

    void loadFollowUpConfig()

    return () => {
      isMounted = false
    }
  }, [])

  // Show empty state if no patient selected
  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav forceBackButton backButtonHref="/pacientes" />
      </div>
    )
  }

  // Get consultation data (use selected or latest)
  const consultation = selectedConsultation || selectedPatient.consultations[0]
  
  // Refresh consultation details when consultation changes.
  useEffect(() => {
    latestReinterpretationRequestId.current += 1
    setReinterpretationLoading(false)
    setReinterpretationErrorMessage(null)

    void loadConsultationClinicalData(consultation?.id)
  }, [consultation?.id, selectedPatient?.id])
  
  if (!consultation) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav forceBackButton backButtonHref="/pacientes" />
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
    antecedente_preeclampsia_embarazo_previo: selectedPatient.antecedente_preeclampsia_embarazo_previo,
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
  const currentRiskData = {
    riesgo: normalizeClinicalRisk(consultationDetails?.riesgo || backendRisk),
    riesgo_ml: consultationDetails?.riesgo_ml
      ? normalizeClinicalRisk(consultationDetails.riesgo_ml)
      : null,
    riesgo_ml_modelo: consultationDetails?.riesgo_ml_modelo ?? null,
    confianza_ml: consultationDetails?.confianza_ml ?? null,
    score_total: consultationDetails?.score_total ?? null,
  }

  const followUpByRisk = useMemo(() => resolveFollowUpByRisk(followUpConfig), [followUpConfig])
  const followUpDays = getFollowUpDaysForRisk(currentRiskData.riesgo, followUpByRisk)
  const nextAppointmentDate = calculateNextAppointmentDate(consultation, followUpDays)
  const nextAppointmentLabel = nextAppointmentDate
    ? formatDateTimeInMexico(
        nextAppointmentDate,
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        },
        "No disponible",
      )
    : "No disponible"

  const parsedConsultationId = Number.parseInt(consultation.id, 10)
  const manualInterpretationForSelectedConsultation =
    !Number.isNaN(parsedConsultationId) && manualInterpretation?.consulta_id === parsedConsultationId
      ? manualInterpretation.interpretacion
      : null

  const interpretationText = hasInterpretation(manualInterpretationForSelectedConsultation)
    ? manualInterpretationForSelectedConsultation
    : consultationDetails?.interpretacion

  const reportIsAvailable = hasInterpretation(interpretationText)
  const clinicalInterpretation = reportIsAvailable
    ? interpretationText!.trim()
    : "Sin interpretación disponible"
  const canGeneratePrediction = !!consultation.id

  return (
    <div className="min-h-screen bg-background">
      <MainNav forceBackButton backButtonHref="/pacientes" />
      
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
              isLoading={consultationLoading}
              errorMessage={consultationErrorMessage}
              onRetry={consultation?.id
                ? () => void loadConsultationClinicalData(consultation.id)
                : undefined}
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
            <Card className="border-border/50 shadow-sm">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Proxima cita sugerida</h3>
                </div>

                <p className="text-sm text-muted-foreground">
                  Riesgo actual: <span className="font-medium text-foreground">{riskLabelByNormalizedRisk[currentRiskData.riesgo]}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Frecuencia configurada: <span className="font-medium text-foreground">cada {followUpDays} dias</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Fecha estimada: <span className="font-medium text-foreground">{nextAppointmentLabel}</span>
                </p>

                {followUpConfigError && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    No se pudo leer la configuracion de seguimiento del backend. Se usan valores por defecto (30, 14 y 7 dias).
                  </p>
                )}
              </CardContent>
            </Card>

            <RecommendationsCard 
              riesgo={currentRiskData.riesgo}
              interpretation={clinicalInterpretation}
              isLoadingInterpretation={reinterpretationLoading}
              interpretationErrorMessage={reinterpretationErrorMessage}
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
