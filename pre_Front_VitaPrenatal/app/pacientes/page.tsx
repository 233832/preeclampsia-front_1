"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePatients, Patient, PatientRegistrationInput } from "@/lib/patient-context"
import { PacienteCreateFormInput } from "@/interfaz/paciente"
import { useConfiguration } from "@/lib/configuration-context"
import { consultaService } from "@/servicios/consultaService"
import { MainNav } from "@/components/navigation/main-nav"
import { PatientsTable } from "@/components/patients/patients-table"
import { PatientForm } from "@/components/patients/patient-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/toaster"
import { UserPlus, Search } from "lucide-react"

export default function PacientesPage() {
  const router = useRouter()
  const { patients, addPatient, updatePatient, deletePatient, selectPatient } = usePatients()
  const { fetchNotificaciones } = useConfiguration()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [hasRegisteredConsultations, setHasRegisteredConsultations] = useState(false)
  const [antecedentsLocked, setAntecedentsLocked] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleView = (patient: Patient) => {
    selectPatient(patient)
    router.push("/")
  }

  const handleEdit = async (patient: Patient) => {
    const hasCachedConsultas = patient.consultations.length > 0

    setHasRegisteredConsultations(hasCachedConsultas)
    setAntecedentsLocked(hasCachedConsultas)
    setEditingPatient(patient)
    setIsFormOpen(true)

    try {
      const consultas = await consultaService.listarPorPacienteId(patient.pacienteId)
      const hasConsultas = consultas.length > 0
      setHasRegisteredConsultations(hasConsultas)
      setAntecedentsLocked(hasConsultas)
    } catch (error) {
      console.error("Error al verificar consultas del paciente:", error)
    }
  }

  const handleDelete = (id: string) => {
    deletePatient(id)
  }

  const handleSave = async (patientData: PatientRegistrationInput) => {
    await addPatient(patientData)
    await fetchNotificaciones()
    setEditingPatient(null)
  }

  const handleUpdate = async (id: string, patientData: PacienteCreateFormInput) => {
    await updatePatient(id, patientData)
    await fetchNotificaciones()
    setEditingPatient(null)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingPatient(null)
    setHasRegisteredConsultations(false)
    setAntecedentsLocked(false)
  }

  const handleOpenForm = () => {
    setEditingPatient(null)
    setHasRegisteredConsultations(false)
    setAntecedentsLocked(false)
    setIsFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Pacientes Registrados</h2>
            <p className="text-sm text-muted-foreground">
              Gestione los registros de pacientes del sistema
            </p>
          </div>
          <Button onClick={handleOpenForm} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Agregar Paciente
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <PatientsTable
          patients={filteredPatients}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Form Modal */}
        <PatientForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSave}
          onUpdate={handleUpdate}
          editingPatient={editingPatient}
          hasRegisteredConsultations={hasRegisteredConsultations}
          antecedentsLocked={antecedentsLocked}
        />
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

      <Toaster />
    </div>
  )
}
