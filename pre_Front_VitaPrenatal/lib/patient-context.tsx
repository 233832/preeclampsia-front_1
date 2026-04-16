"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { pacienteService } from '@/servicios/pacienteService';
import { expedienteService } from '@/servicios/expedienteService';
import { consultaService } from '@/servicios/consultaService';
import type { PacienteCreateFormInput, PacienteResponse } from '@/interfaz/paciente';
import type { Consulta as ApiConsulta } from '@/interfaz/consulta';
import { extractDateTimeInMexico, getDateTimeSortKey } from "@/lib/mexico-time"
import { normalizeClinicalRisk } from "@/lib/risk-normalization"
import { mapPatientFormToCreatePayload } from "@/servicios/pacienteMapper"

export type RiskLevel = "none" | "low" | "moderate" | "high"

function mapApiRisk(riesgo: string): RiskLevel {
  switch (normalizeClinicalRisk(riesgo)) {
    case "NINGUNO":
      return "none"
    case "MEDIO":
      return "moderate"
    case "ALTO":
    case "HOSPITALIZACION":
      return "high"
    default:
      return "none"
  }
}

type ApiConsultaConId = ApiConsulta & { id: number }

function hasConsultaId(consulta: ApiConsulta): consulta is ApiConsultaConId {
  return typeof consulta.id === "number"
}

function getConsultationDateTimeFromApi(value: string): { date: string; time: string } {
  const normalized = extractDateTimeInMexico(value)

  if (normalized) {
    return normalized
  }

  const [date = "", rawTime = "00:00"] = value.split("T")
  return {
    date,
    time: rawTime.slice(0, 5),
  }
}

interface ConsultationAntecedents {
  previousHypertension: boolean
  diabetes: boolean
  familyHypertensionHistory: boolean
}

export interface Consultation {
  id: string
  date: string
  time: string
  gestationalWeek: number
  weight: number
  height: number
  bmi: number
  pam: number
  systolic: number
  diastolic: number
  previousHypertension: boolean
  diabetes: boolean
  familyHypertensionHistory: boolean
  riskLevel: RiskLevel
  riskProbability: number
  notes?: string
}

export type ConsultationCreateInput = Omit<
  Consultation,
  "id" | "bmi" | "riskLevel" | "riskProbability" | "previousHypertension" | "diabetes" | "familyHypertensionHistory"
>

export interface PatientRegistrationInput extends PacienteCreateFormInput {
  consultation: Omit<Consultation, "id" | "bmi" | "riskLevel" | "riskProbability">
}

export interface Patient {
  id: string
  pacienteId: number
  name: string
  age: number
  address: string
  city: string
  phone: string
  maritalStatus: string
  tipo_sangre: string | null
  previousHypertension: boolean
  diabetes: boolean
  familyHypertensionHistory: boolean
  fam_cardiopatia: boolean
  enf_renal_cronica: boolean
  abortos_previos: number
  cesarea_previos: number
  embarazos_previos: number
  partos_previos: number
  embarazo_multiple: boolean
  muerte_fetal: boolean
  restriccion_fetal: boolean
  consultations: Consultation[]
}

// Helper to get latest consultation
export function getLatestConsultation(patient: Patient): Consultation | null {
  if (patient.consultations.length === 0) return null

  return [...patient.consultations].sort((a, b) => {
    return getDateTimeSortKey(b.date, b.time).localeCompare(getDateTimeSortKey(a.date, a.time))
  })[0]
}

interface PatientContextType {
  patients: Patient[]
  loading: boolean
  selectedPatient: Patient | null
  selectedConsultation: Consultation | null
  addPatient: (patient: PatientRegistrationInput) => Promise<void>
  updatePatient: (id: string, patient: PacienteCreateFormInput) => Promise<void>
  deletePatient: (id: string) => void
  selectPatient: (patient: Patient | null) => void
  addConsultation: (patientId: string, consultation: ConsultationCreateInput) => Promise<void>
  selectConsultation: (consultation: Consultation | null) => void
  updateConsultation: (patientId: string, consultationId: string, data: Partial<Consultation>) => void
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

function calculateMeanArterialPressure(systolic: number, diastolic: number): number {
  return Number(((systolic + (2 * diastolic)) / 3).toFixed(1))
}

function mapAntecedentsFromPacienteApi(paciente: PacienteResponse): ConsultationAntecedents {
  return {
    previousHypertension: paciente.hipertension_previa ?? false,
    diabetes: paciente.diabetes ?? false,
    familyHypertensionHistory: paciente.antecedentes_familia_hipertension ?? false,
  }
}

function mapConsultaFromApi(
  consulta: ApiConsultaConId,
  antecedentes: ConsultationAntecedents,
): Consultation {
  const { date, time } = getConsultationDateTimeFromApi(consulta.fecha_hora_consulta)
  const pam = typeof consulta.pam === "number"
    ? consulta.pam
    : calculateMeanArterialPressure(consulta.presion_sistolica, consulta.presion_diastolica)

  return {
    id: consulta.id.toString(),
    date,
    time,
    gestationalWeek: consulta.edad_gestacional,
    weight: consulta.peso,
    height: consulta.altura,
    bmi: consulta.imc,
    pam,
    systolic: consulta.presion_sistolica,
    diastolic: consulta.presion_diastolica,
    previousHypertension: antecedentes.previousHypertension,
    diabetes: antecedentes.diabetes,
    familyHypertensionHistory: antecedentes.familyHypertensionHistory,
    riskLevel: mapApiRisk(consulta.riesgo || "NINGUNO"),
    riskProbability: 0,
  }
}

function mapPacienteFromApi(
  paciente: PacienteResponse,
  expedienteId: number,
  consultations: Consultation[],
): Patient {
  return {
    id: expedienteId.toString(),
    pacienteId: paciente.id,
    name: paciente.nombre,
    age: paciente.edad,
    address: paciente.domicilio ?? "",
    city: paciente.ciudad ?? "",
    phone: paciente.telefono ?? "",
    maritalStatus: paciente.estado_civil ?? "No especificado",
    tipo_sangre: paciente.tipo_sangre ?? null,
    previousHypertension: paciente.hipertension_previa ?? false,
    diabetes: paciente.diabetes ?? false,
    familyHypertensionHistory: paciente.antecedentes_familia_hipertension ?? false,
    fam_cardiopatia: paciente.fam_cardiopatia ?? false,
    enf_renal_cronica: paciente.enf_renal_cronica ?? false,
    abortos_previos: paciente.abortos_previos ?? 0,
    cesarea_previos: paciente.cesarea_previos ?? 0,
    embarazos_previos: paciente.embarazos_previos ?? 0,
    partos_previos: paciente.partos_previos ?? 0,
    embarazo_multiple: paciente.embarazo_multiple ?? false,
    muerte_fetal: paciente.muerte_fetal ?? false,
    restriccion_fetal: paciente.restriccion_fetal ?? false,
    consultations,
  }
}

// Sample patients data with consultations
const initialPatients: Patient[] = []

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)

  const loadPatientsFromBackend = async (): Promise<Patient[]> => {
    const expedientes = await expedienteService.listar();
    const allConsultas = await consultaService.listar();

    const loadedPatients = await Promise.all(
      expedientes.map(async (exp) => {
        const paciente = await pacienteService.obtenerPorId(exp.paciente_id);
        const antecedentes = mapAntecedentsFromPacienteApi(paciente)
        const consultasForExp = allConsultas
          .filter((c): c is ApiConsultaConId => c.expediente_id === exp.id && hasConsultaId(c))
          .map((c) => mapConsultaFromApi(c, antecedentes));

        return mapPacienteFromApi(paciente, exp.id, consultasForExp)
      }),
    )

    return loadedPatients
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedPatients = await loadPatientsFromBackend()
        setPatients(loadedPatients)
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addPatient = async (patientData: PatientRegistrationInput) => {
    const { consultation, ...patientInfo } = patientData;
    
    try {
      const pacientePayload = mapPatientFormToCreatePayload(patientInfo)
      const pacienteResponse = await pacienteService.crear(pacientePayload)
      
      // Create expediente
      const expedienteData = { paciente_id: pacienteResponse.id };
      const expedienteResponse = await expedienteService.crear(expedienteData);
      const calculatedPam = Number.isFinite(consultation.pam)
        ? consultation.pam
        : calculateMeanArterialPressure(consultation.systolic, consultation.diastolic)
      
      // Create consulta
      const consultaData = {
        paciente_id: pacienteResponse.id,
        expediente_id: expedienteResponse.id,
        fecha_hora_consulta: `${consultation.date}T${consultation.time}:00`,
        edad_madre: patientInfo.age,
        edad_gestacional: consultation.gestationalWeek,
        altura: consultation.height,
        peso: consultation.weight,
        imc: calculateBMI(consultation.weight, consultation.height),
        presion_sistolica: consultation.systolic,
        presion_diastolica: consultation.diastolic,
        pam: calculatedPam,
      };
      const consultaCreada = await consultaService.crear(consultaData);

      if (typeof consultaCreada.id === "number") {
        await consultaService.obtenerPrediccion(consultaCreada.id)
      }
      
      const refreshedPatients = await loadPatientsFromBackend()
      setPatients(refreshedPatients)
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error
    }
  }

  const updatePatient = async (id: string, patientData: PacienteCreateFormInput) => {
    const currentPatient = patients.find((patient) => patient.id === id)

    if (!currentPatient) {
      throw new Error("Recurso no encontrado")
    }

    const payload = mapPatientFormToCreatePayload(patientData)
    const pacienteActualizado = await pacienteService.actualizar(currentPatient.pacienteId, payload)

    const expedienteId = Number.parseInt(currentPatient.id, 10)
    const resolvedExpedienteId = Number.isNaN(expedienteId) ? currentPatient.pacienteId : expedienteId

    const updatedConsultations = currentPatient.consultations.map((consultation) => ({
      ...consultation,
      previousHypertension: pacienteActualizado.hipertension_previa ?? false,
      diabetes: pacienteActualizado.diabetes ?? false,
      familyHypertensionHistory: pacienteActualizado.antecedentes_familia_hipertension ?? false,
    }))

    const updatedPatient = mapPacienteFromApi(
      pacienteActualizado,
      resolvedExpedienteId,
      updatedConsultations,
    )

    setPatients((prev) => prev.map((patient) => (patient.id === id ? updatedPatient : patient)))

    if (selectedPatient?.id === id) {
      setSelectedPatient(updatedPatient)

      if (selectedConsultation) {
        const refreshedSelectedConsultation = updatedPatient.consultations.find(
          (consultation) => consultation.id === selectedConsultation.id,
        )

        if (refreshedSelectedConsultation) {
          setSelectedConsultation(refreshedSelectedConsultation)
        }
      }
    }
  }

  const deletePatient = async (id: string) => {
    try {
      await expedienteService.eliminar(parseInt(id));
      setPatients((prev) => prev.filter((p) => p.id !== id))
      if (selectedPatient?.id === id) {
        setSelectedPatient(null)
        setSelectedConsultation(null)
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  }

  const selectPatient = (patient: Patient | null) => {
    setSelectedPatient(patient)
    if (patient) {
      const latest = getLatestConsultation(patient)
      setSelectedConsultation(latest)
    } else {
      setSelectedConsultation(null)
    }
  }

  const addConsultation = async (patientId: string, consultationData: ConsultationCreateInput) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      throw new Error("Recurso no encontrado")
    }

    try {
      const expedienteId = Number.parseInt(patientId, 10)
      if (Number.isNaN(expedienteId)) {
        throw new Error("ID de expediente invalido")
      }

      const expediente = await expedienteService.obtenerPorId(expedienteId)

      const consultaData = {
        paciente_id: expediente.paciente_id,
        expediente_id: expedienteId,
        fecha_hora_consulta: `${consultationData.date}T${consultationData.time}:00`,
        edad_madre: patient.age,
        edad_gestacional: consultationData.gestationalWeek,
        altura: consultationData.height,
        peso: consultationData.weight,
        imc: calculateBMI(consultationData.weight, consultationData.height),
        presion_sistolica: consultationData.systolic,
        presion_diastolica: consultationData.diastolic,
        pam: Number.isFinite(consultationData.pam)
          ? consultationData.pam
          : calculateMeanArterialPressure(consultationData.systolic, consultationData.diastolic),
      };
      const nuevaConsulta = await consultaService.crear(consultaData);

      if (typeof nuevaConsulta.id === "number") {
        await consultaService.obtenerPrediccion(nuevaConsulta.id)
      }
      
      // Reload consultations for this patient
      const allPatientConsultas = await consultaService.listarPorPacienteId(expediente.paciente_id);
      const consultasForExp = allPatientConsultas
        .filter((c): c is ApiConsultaConId => c.expediente_id === expedienteId && hasConsultaId(c))
        .map((c) => mapConsultaFromApi(c, {
          previousHypertension: patient.previousHypertension,
          diabetes: patient.diabetes,
          familyHypertensionHistory: patient.familyHypertensionHistory,
        }));
      
      setPatients(prev => prev.map((p) => {
        if (p.id !== patientId) {
          return p
        }

        return { ...p, consultations: consultasForExp }
      }));
      
      // Update selected consultation if this is the current patient
      if (selectedPatient?.id === patientId) {
        const updatedSelectedPatient = { ...selectedPatient, consultations: consultasForExp }
        setSelectedPatient(updatedSelectedPatient)
        const latest = getLatestConsultation(updatedSelectedPatient)
        setSelectedConsultation(latest)
      }
    } catch (error) {
      console.error('Error adding consultation:', error);
      throw error
    }
  }

  const selectConsultation = (consultation: Consultation | null) => {
    setSelectedConsultation(consultation)
  }

  const updateConsultation = (patientId: string, consultationId: string, data: Partial<Consultation>) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p
        return {
          ...p,
          consultations: p.consultations.map((c) => {
            if (c.id !== consultationId) return c

            const updated = { ...c, ...data }

            // Recalculate BMI if weight or height changed
            if (data.weight !== undefined || data.height !== undefined) {
              updated.bmi = calculateBMI(updated.weight, updated.height)
            }

            if (data.systolic !== undefined || data.diastolic !== undefined) {
              updated.pam = calculateMeanArterialPressure(updated.systolic, updated.diastolic)
            }

            return updated
          }),
        }
      })
    )

    // Update selected consultation if it's the one being edited
    if (selectedConsultation?.id === consultationId && selectedPatient?.id === patientId) {
      const updated = { ...selectedConsultation, ...data }
      if (data.weight !== undefined || data.height !== undefined) {
        updated.bmi = calculateBMI(updated.weight, updated.height)
      }
      if (data.systolic !== undefined || data.diastolic !== undefined) {
        updated.pam = calculateMeanArterialPressure(updated.systolic, updated.diastolic)
      }
      setSelectedConsultation(updated)
    }
  }

  return (
    <PatientContext.Provider
      value={{
        patients,
        loading,
        selectedPatient,
        selectedConsultation,
        addPatient,
        updatePatient,
        deletePatient,
        selectPatient,
        addConsultation,
        selectConsultation,
        updateConsultation,
      }}
    >
      {children}
    </PatientContext.Provider>
  )
}

export function usePatients() {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error("usePatients must be used within a PatientProvider")
  }
  return context
}
