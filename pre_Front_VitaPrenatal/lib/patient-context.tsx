"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type RiskLevel = "none" | "low" | "moderate" | "high"

export interface Consultation {
  id: string
  date: string
  time: string
  gestationalWeek: number
  weight: number
  height: number
  bmi: number
  systolic: number
  diastolic: number
  previousHypertension: boolean
  diabetes: boolean
  familyHypertensionHistory: boolean
  riskLevel: RiskLevel
  riskProbability: number
  notes?: string
}

export interface Patient {
  id: string
  name: string
  age: number
  address: string
  city: string
  phone: string
  maritalStatus: string
  consultations: Consultation[]
}

// Helper to get latest consultation
export function getLatestConsultation(patient: Patient): Consultation | null {
  if (patient.consultations.length === 0) return null
  return patient.consultations.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime()
  })[0]
}

interface PatientContextType {
  patients: Patient[]
  selectedPatient: Patient | null
  selectedConsultation: Consultation | null
  addPatient: (patient: Omit<Patient, "id" | "consultations"> & { consultation: Omit<Consultation, "id" | "bmi" | "riskLevel" | "riskProbability"> }) => void
  updatePatient: (id: string, patient: Partial<Omit<Patient, "consultations">>) => void
  deletePatient: (id: string) => void
  selectPatient: (patient: Patient | null) => void
  addConsultation: (patientId: string, consultation: Omit<Consultation, "id" | "bmi" | "riskLevel" | "riskProbability">) => void
  selectConsultation: (consultation: Consultation | null) => void
  updateConsultation: (patientId: string, consultationId: string, data: Partial<Consultation>) => void
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

function calculateRiskLevel(
  systolic: number,
  diastolic: number,
  previousHypertension: boolean,
  diabetes: boolean,
  familyHypertensionHistory: boolean
): { level: RiskLevel; probability: number } {
  let riskScore = 0

  // Blood pressure contribution
  if (systolic >= 140 || diastolic >= 90) {
    riskScore += 3
  } else if (systolic >= 130 || diastolic >= 80) {
    riskScore += 2
  } else if (systolic >= 120) {
    riskScore += 1
  }

  // History contribution
  if (previousHypertension) riskScore += 2
  if (diabetes) riskScore += 1
  if (familyHypertensionHistory) riskScore += 1

  if (riskScore >= 5) return { level: "high", probability: 99.9 }
  if (riskScore >= 3) return { level: "moderate", probability: 66.6 }
  if (riskScore >= 1) return { level: "low", probability: 33.3 }
  return { level: "none", probability: 0 }
}

// Sample patients data with consultations
const initialPatients: Patient[] = [
  {
    id: "1",
    name: "Maria Garcia Lopez",
    age: 32,
    address: "Calle Principal 123",
    city: "Ciudad de Mexico",
    phone: "555-1234567",
    maritalStatus: "Casada",
    consultations: [
      {
        id: "c1-1",
        date: "2026-02-15",
        time: "09:00",
        gestationalWeek: 18,
        weight: 68,
        height: 165,
        bmi: 24.98,
        systolic: 115,
        diastolic: 72,
        previousHypertension: false,
        diabetes: false,
        familyHypertensionHistory: true,
        riskLevel: "none",
        riskProbability: 0,
      },
      {
        id: "c1-2",
        date: "2026-03-01",
        time: "10:30",
        gestationalWeek: 20,
        weight: 70,
        height: 165,
        bmi: 25.71,
        systolic: 118,
        diastolic: 76,
        previousHypertension: false,
        diabetes: false,
        familyHypertensionHistory: true,
        riskLevel: "none",
        riskProbability: 0,
      },
      {
        id: "c1-3",
        date: "2026-03-22",
        time: "10:30",
        gestationalWeek: 24,
        weight: 72,
        height: 165,
        bmi: 26.4,
        systolic: 126,
        diastolic: 81,
        previousHypertension: false,
        diabetes: false,
        familyHypertensionHistory: true,
        riskLevel: "low",
        riskProbability: 33.3,
      },
    ],
  },
  {
    id: "2",
    name: "Ana Martinez Ruiz",
    age: 28,
    address: "Av. Reforma 456",
    city: "Guadalajara",
    phone: "555-9876543",
    maritalStatus: "Soltera",
    consultations: [
      {
        id: "c2-1",
        date: "2026-03-20",
        time: "09:00",
        gestationalWeek: 18,
        weight: 65,
        height: 160,
        bmi: 25.4,
        systolic: 118,
        diastolic: 75,
        previousHypertension: false,
        diabetes: false,
        familyHypertensionHistory: false,
        riskLevel: "none",
        riskProbability: 0,
      },
    ],
  },
  {
    id: "3",
    name: "Carmen Hernandez Vega",
    age: 35,
    address: "Blvd. Centro 789",
    city: "Monterrey",
    phone: "555-4567890",
    maritalStatus: "Casada",
    consultations: [
      {
        id: "c3-1",
        date: "2026-02-10",
        time: "11:00",
        gestationalWeek: 24,
        weight: 75,
        height: 158,
        bmi: 30.0,
        systolic: 135,
        diastolic: 85,
        previousHypertension: true,
        diabetes: true,
        familyHypertensionHistory: true,
        riskLevel: "moderate",
        riskProbability: 66.6,
      },
      {
        id: "c3-2",
        date: "2026-03-21",
        time: "14:15",
        gestationalWeek: 30,
        weight: 78,
        height: 158,
        bmi: 31.2,
        systolic: 142,
        diastolic: 92,
        previousHypertension: true,
        diabetes: true,
        familyHypertensionHistory: true,
        riskLevel: "high",
        riskProbability: 99.9,
      },
    ],
  },
]

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)

  const addPatient = (patientData: Omit<Patient, "id" | "consultations"> & { consultation: Omit<Consultation, "id" | "bmi" | "riskLevel" | "riskProbability"> }) => {
    const { consultation, ...patientInfo } = patientData
    
    const bmi = calculateBMI(consultation.weight, consultation.height)
    const { level, probability } = calculateRiskLevel(
      consultation.systolic,
      consultation.diastolic,
      consultation.previousHypertension,
      consultation.diabetes,
      consultation.familyHypertensionHistory
    )

    const newConsultation: Consultation = {
      ...consultation,
      id: `c-${Date.now()}`,
      bmi,
      riskLevel: level,
      riskProbability: probability,
    }

    const newPatient: Patient = {
      ...patientInfo,
      id: Date.now().toString(),
      consultations: [newConsultation],
    }

    setPatients((prev) => [...prev, newPatient])
  }

  const updatePatient = (id: string, patientData: Partial<Omit<Patient, "consultations">>) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        return { ...p, ...patientData }
      })
    )
  }

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
    if (selectedPatient?.id === id) {
      setSelectedPatient(null)
      setSelectedConsultation(null)
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

  const addConsultation = (patientId: string, consultationData: Omit<Consultation, "id" | "bmi" | "riskLevel" | "riskProbability">) => {
    const bmi = calculateBMI(consultationData.weight, consultationData.height)
    const { level, probability } = calculateRiskLevel(
      consultationData.systolic,
      consultationData.diastolic,
      consultationData.previousHypertension,
      consultationData.diabetes,
      consultationData.familyHypertensionHistory
    )

    const newConsultation: Consultation = {
      ...consultationData,
      id: `c-${Date.now()}`,
      bmi,
      riskLevel: level,
      riskProbability: probability,
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p
        return {
          ...p,
          consultations: [...p.consultations, newConsultation],
        }
      })
    )

    // Update selected patient if this is the current one
    if (selectedPatient?.id === patientId) {
      const updatedPatient = {
        ...selectedPatient,
        consultations: [...selectedPatient.consultations, newConsultation],
      }
      setSelectedPatient(updatedPatient)
      setSelectedConsultation(newConsultation)
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

            // Recalculate risk if relevant fields changed
            if (
              data.systolic !== undefined ||
              data.diastolic !== undefined ||
              data.previousHypertension !== undefined ||
              data.diabetes !== undefined ||
              data.familyHypertensionHistory !== undefined
            ) {
              const { level, probability } = calculateRiskLevel(
                updated.systolic,
                updated.diastolic,
                updated.previousHypertension,
                updated.diabetes,
                updated.familyHypertensionHistory
              )
              updated.riskLevel = level
              updated.riskProbability = probability
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
      if (
        data.systolic !== undefined ||
        data.diastolic !== undefined ||
        data.previousHypertension !== undefined ||
        data.diabetes !== undefined ||
        data.familyHypertensionHistory !== undefined
      ) {
        const { level, probability } = calculateRiskLevel(
          updated.systolic,
          updated.diastolic,
          updated.previousHypertension,
          updated.diabetes,
          updated.familyHypertensionHistory
        )
        updated.riskLevel = level
        updated.riskProbability = probability
      }
      setSelectedConsultation(updated)
    }
  }

  return (
    <PatientContext.Provider
      value={{
        patients,
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
