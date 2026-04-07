"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { pacienteService } from '@/servicios/pacienteService';
import { expedienteService } from '@/servicios/expedienteService';
import { consultaService } from '@/servicios/consultaService';

export type RiskLevel = "none" | "low" | "moderate" | "high"

function mapApiRisk(riesgo: string): RiskLevel {
  switch (riesgo.toUpperCase()) {
    case "NINGUNO":
      return "none"
    case "BAJO":
      return "low"
    case "MEDIO":
      return "moderate"
    case "ALTO":
      return "high"
    default:
      return "none"
  }
}

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
  previousHypertension: boolean
  diabetes: boolean
  familyHypertensionHistory: boolean
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
  loading: boolean
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
const initialPatients: Patient[] = []

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const expedientes = await expedienteService.listar();
        const allConsultas = await consultaService.listar();
        console.log("🔍 CONSULTAS DEL API:", allConsultas);
        const patientMap = new Map<string, Patient>();

        for (const exp of expedientes) {
          const paciente = await pacienteService.obtenerPorId(exp.paciente_id);
          const consultasForExp = allConsultas.filter(c => c.expediente_id === exp.id).map(c => {
            console.log(`📋 Procesando consulta ID ${c.id}:`, { riesgo: c.riesgo, presion_sistolica: c.presion_sistolica, presion_diastolica: c.presion_diastolica, imc: c.imc });
            return {
              id: c.id.toString(),
              date: c.fecha_hora_consulta.split('T')[0],
              time: c.fecha_hora_consulta.split('T')[1].slice(0,5),
              gestationalWeek: c.edad_gestacional,
              weight: c.peso,
              height: c.altura,
              bmi: c.imc,
              systolic: c.presion_sistolica,
              diastolic: c.presion_diastolica,
              previousHypertension: paciente.hipertension_previa,
              diabetes: paciente.diabetes,
              familyHypertensionHistory: paciente.antecedentes_familia_hipertension,
              riskLevel: mapApiRisk(c.riesgo || "NINGUNO"),
              riskProbability: 0, // Could be calculated or from API if available
            }
          });

          const patient: Patient = {
            id: exp.id.toString(),
            name: paciente.nombre,
            age: paciente.edad,
            address: paciente.domicilio,
            city: paciente.ciudad,
            phone: paciente.telefono,
            maritalStatus: paciente.estado_civil,
            previousHypertension: paciente.hipertension_previa,
            diabetes: paciente.diabetes,
            familyHypertensionHistory: paciente.antecedentes_familia_hipertension,
            consultations: consultasForExp,
          };
          patientMap.set(exp.id.toString(), patient);
        }
        setPatients(Array.from(patientMap.values()));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addPatient = async (patientData: Omit<Patient, "id" | "consultations"> & { consultation: Omit<Consultation, "id" | "bmi" | "riskLevel" | "riskProbability"> }) => {
    const { consultation, ...patientInfo } = patientData;
    
    try {
      // Create paciente
      const pacienteData = {
        nombre: patientInfo.name,
        edad: patientInfo.age,
        domicilio: patientInfo.address,
        ciudad: patientInfo.city,
        telefono: patientInfo.phone,
        estado_civil: patientInfo.maritalStatus,
        hipertension_previa: patientInfo.previousHypertension ?? false,
        diabetes: patientInfo.diabetes ?? false,
        antecedentes_familia_hipertension: patientInfo.familyHypertensionHistory ?? false,
      };
      console.log("🛠️ Enviando paciente al backend:", pacienteData);
      const pacienteResponse = await pacienteService.crear(pacienteData);
      console.log("✅ Paciente creado (respuesta backend):", pacienteResponse);
      
      // Create expediente
      const expedienteData = { paciente_id: pacienteResponse.id };
      const expedienteResponse = await expedienteService.crear(expedienteData);
      
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
      };
      await consultaService.crear(consultaData);
      
      // Reload data
      // For simplicity, reload all
      const expedientes = await expedienteService.listar();
      // ... same as in useEffect
      // To avoid duplication, perhaps extract to a function
      // For now, duplicate
      const allConsultas = await consultaService.listar();
      const patientMap = new Map<string, Patient>();
      for (const exp of expedientes) {
        const paciente = await pacienteService.obtenerPorId(exp.paciente_id);
        const consultasForExp = allConsultas.filter(c => c.expediente_id === exp.id).map(c => ({
          id: c.id.toString(),
          date: c.fecha_hora_consulta.split('T')[0],
          time: c.fecha_hora_consulta.split('T')[1].slice(0,5),
          gestationalWeek: c.edad_gestacional,
          weight: c.peso,
          height: c.altura,
          bmi: c.imc,
          systolic: c.presion_sistolica,
          diastolic: c.presion_diastolica,
          previousHypertension: paciente.hipertension_previa,
          diabetes: paciente.diabetes,
          familyHypertensionHistory: paciente.antecedentes_familia_hipertension,
          riskLevel: 'none' as RiskLevel,
          riskProbability: 0,
        }));
        consultasForExp.forEach(consult => {
          const { level, probability } = calculateRiskLevel(
            consult.systolic,
            consult.diastolic,
            consult.previousHypertension,
            consult.diabetes,
            consult.familyHypertensionHistory
          );
          consult.riskLevel = level;
          consult.riskProbability = probability;
        });
        const patient: Patient = {
          id: exp.id.toString(),
          name: paciente.nombre,
          age: paciente.edad,
          address: paciente.domicilio,
          city: paciente.ciudad,
          phone: paciente.telefono,
          maritalStatus: paciente.estado_civil,
          previousHypertension: paciente.hipertension_previa,
          diabetes: paciente.diabetes,
          familyHypertensionHistory: paciente.antecedentes_familia_hipertension,
          consultations: consultasForExp,
        };
        patientMap.set(exp.id.toString(), patient);
      }
      setPatients(Array.from(patientMap.values()));
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  }

  const updatePatient = (id: string, patientData: Partial<Omit<Patient, "consultations">>) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        return { ...p, ...patientData }
      })
    )
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

  const addConsultation = async (patientId: string, consultationData: Omit<Consultation, "id" | "bmi" | "riskLevel" | "riskProbability">) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    try {
      const consultaData = {
        paciente_id: parseInt(patientId), // wait, patientId is expediente id, but paciente_id is separate.
        expediente_id: parseInt(patientId),
        fecha_hora_consulta: `${consultationData.date}T${consultationData.time}:00`,
        edad_madre: patient.age,
        edad_gestacional: consultationData.gestationalWeek,
        altura: consultationData.height,
        peso: consultationData.weight,
        imc: calculateBMI(consultationData.weight, consultationData.height),
        presion_sistolica: consultationData.systolic,
        presion_diastolica: consultationData.diastolic,
      };
      console.log("🛠️ Enviando consulta al backend:", consultaData);
      const nuevaConsulta = await consultaService.crear(consultaData);
      console.log("✅ Consulta creada (respuesta backend):", nuevaConsulta);
      
      // Reload consultations for this patient
      const allConsultas = await consultaService.listar();
      const consultasForExp = allConsultas.filter(c => c.expediente_id === parseInt(patientId)).map(c => ({
        id: c.id.toString(),
        date: c.fecha_hora_consulta.split('T')[0],
        time: c.fecha_hora_consulta.split('T')[1].slice(0,5),
        gestationalWeek: c.edad_gestacional,
        weight: c.peso,
        height: c.altura,
        bmi: c.imc,
        systolic: c.presion_sistolica,
        diastolic: c.presion_diastolica,
        previousHypertension: patient.previousHypertension,
        diabetes: patient.diabetes,
        familyHypertensionHistory: patient.familyHypertensionHistory,
        riskLevel: 'none' as RiskLevel,
        riskProbability: 0,
      }));
      consultasForExp.forEach(consult => {
        const { level, probability } = calculateRiskLevel(
          consult.systolic,
          consult.diastolic,
          consult.previousHypertension,
          consult.diabetes,
          consult.familyHypertensionHistory
        );
        consult.riskLevel = level;
        consult.riskProbability = probability;
      });
      
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, consultations: consultasForExp } : p));
      
      // Update selected consultation if this is the current patient
      if (selectedPatient?.id === patientId) {
        const latest = getLatestConsultation({ ...selectedPatient, consultations: consultasForExp });
        setSelectedConsultation(latest);
      }
    } catch (error) {
      console.error('Error adding consultation:', error);
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
