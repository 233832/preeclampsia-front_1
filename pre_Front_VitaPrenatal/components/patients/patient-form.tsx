"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Patient, Consultation, getLatestConsultation } from "@/lib/patient-context"
import { User, MapPin, Phone, Calendar, Activity, Scale } from "lucide-react"
import { getCurrentMexicoDate, getCurrentMexicoTime } from "@/lib/mexico-time"

type PatientFormData = Omit<Patient, "id" | "consultations"> & {
  consultation: Omit<Consultation, "id" | "bmi" | "riskLevel" | "riskProbability">
}

interface PatientFormProps {
  open: boolean
  onClose: () => void
  onSave: (patient: PatientFormData) => void
  onUpdate?: (id: string, patient: Partial<Omit<Patient, "consultations">>) => void
  editingPatient?: Patient | null
}

const maritalStatusOptions = [
  "Soltera",
  "Casada",
  "Divorciada",
  "Viuda",
  "Union libre",
]

export function PatientForm({ open, onClose, onSave, onUpdate, editingPatient }: PatientFormProps) {
  const latestConsultation = editingPatient ? getLatestConsultation(editingPatient) : null
  const currentMexicoDate = getCurrentMexicoDate()
  const currentMexicoTime = getCurrentMexicoTime()

  const [formData, setFormData] = useState({
    // Patient info
    name: "",
    age: 25,
    address: "",
    city: "",
    phone: "",
    maritalStatus: "Soltera",
    // Consultation info
    gestationalWeek: 12,
    weight: 60,
    height: 160,
    systolic: 120,
    diastolic: 80,
    previousHypertension: false,
    diabetes: false,
    familyHypertensionHistory: false,
    consultationDate: currentMexicoDate,
    consultationTime: currentMexicoTime,
  })

  useEffect(() => {
    if (editingPatient) {
      setFormData({
        name: editingPatient.name,
        age: editingPatient.age,
        address: editingPatient.address,
        city: editingPatient.city,
        phone: editingPatient.phone,
        maritalStatus: editingPatient.maritalStatus,
        // Use latest consultation data
        gestationalWeek: latestConsultation?.gestationalWeek ?? 12,
        weight: latestConsultation?.weight ?? 60,
        height: latestConsultation?.height ?? 160,
        systolic: latestConsultation?.systolic ?? 120,
        diastolic: latestConsultation?.diastolic ?? 80,
        previousHypertension: latestConsultation?.previousHypertension ?? false,
        diabetes: latestConsultation?.diabetes ?? false,
        familyHypertensionHistory: latestConsultation?.familyHypertensionHistory ?? false,
        consultationDate: latestConsultation?.date ?? getCurrentMexicoDate(),
        consultationTime: latestConsultation?.time ?? getCurrentMexicoTime(),
      })
    } else {
      // Reset form for new patient
      setFormData({
        name: "",
        age: 25,
        address: "",
        city: "",
        phone: "",
        maritalStatus: "Soltera",
        gestationalWeek: 12,
        weight: 60,
        height: 160,
        systolic: 120,
        diastolic: 80,
        previousHypertension: false,
        diabetes: false,
        familyHypertensionHistory: false,
        consultationDate: getCurrentMexicoDate(),
        consultationTime: getCurrentMexicoTime(),
      })
    }
  }, [editingPatient, latestConsultation, open])

  const calculatedBMI = (formData.weight / ((formData.height / 100) ** 2)).toFixed(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPatient && onUpdate) {
      // Update patient personal info only
      onUpdate(editingPatient.id, {
        name: formData.name,
        age: formData.age,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        maritalStatus: formData.maritalStatus,
      })
    } else {
      // Create new patient with first consultation
      onSave({
        name: formData.name,
        age: formData.age,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        maritalStatus: formData.maritalStatus,
        previousHypertension: formData.previousHypertension,
        diabetes: formData.diabetes,
        familyHypertensionHistory: formData.familyHypertensionHistory,
        consultation: {
          date: formData.consultationDate,
          time: formData.consultationTime,
          gestationalWeek: formData.gestationalWeek,
          weight: formData.weight,
          height: formData.height,
          systolic: formData.systolic,
          diastolic: formData.diastolic,
          previousHypertension: formData.previousHypertension,
          diabetes: formData.diabetes,
          familyHypertensionHistory: formData.familyHypertensionHistory,
        }
      })
    }
    onClose()
  }

  const isEditing = !!editingPatient

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Paciente" : "Agregar Paciente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Edite la informacion personal del paciente."
              : "Complete todos los campos obligatorios del formulario."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Informacion Personal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre completo de la paciente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Edad *</Label>
                <Input
                  id="age"
                  type="number"
                  min={15}
                  max={55}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Estado civil *</Label>
                <select
                  id="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={(event) =>
                    setFormData({ ...formData, maritalStatus: event.target.value })
                  }
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50"
                  required
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>
                  {maritalStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="555-1234567"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Domicilio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address">Direccion *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle, numero, colonia"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ciudad"
                  required
                />
              </div>
            </div>
          </div>

          {/* First Consultation Data - Only show for new patients */}
          {!isEditing && (
            <>
              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Primera Consulta
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gestationalWeek">Semana gestacion *</Label>
                    <Input
                      id="gestationalWeek"
                      type="number"
                      min={1}
                      max={42}
                      value={formData.gestationalWeek}
                      onChange={(e) => setFormData({ ...formData, gestationalWeek: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      min={30}
                      max={200}
                      step={0.1}
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm) *</Label>
                    <Input
                      id="height"
                      type="number"
                      min={100}
                      max={220}
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-end">
                    <div className="w-full p-3 rounded-lg bg-primary/10 text-center">
                      <p className="text-xs text-muted-foreground">IMC Calculado</p>
                      <p className="text-lg font-bold text-primary">{calculatedBMI}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  Presion Arterial
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systolic">Sistolica (mmHg) *</Label>
                    <Input
                      id="systolic"
                      type="number"
                      min={70}
                      max={200}
                      value={formData.systolic}
                      onChange={(e) => setFormData({ ...formData, systolic: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic">Diastolica (mmHg) *</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      min={40}
                      max={130}
                      value={formData.diastolic}
                      onChange={(e) => setFormData({ ...formData, diastolic: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Antecedentes Medicos</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label htmlFor="previousHypertension" className="cursor-pointer">
                      Hipertension previa
                    </Label>
                    <Checkbox
                      id="previousHypertension"
                      checked={formData.previousHypertension}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, previousHypertension: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label htmlFor="diabetes" className="cursor-pointer">
                      Diabetes
                    </Label>
                    <Checkbox
                      id="diabetes"
                      checked={formData.diabetes}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, diabetes: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label htmlFor="familyHistory" className="cursor-pointer">
                      Antecedentes familiares de hipertension
                    </Label>
                    <Checkbox
                      id="familyHistory"
                      checked={formData.familyHypertensionHistory}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, familyHypertensionHistory: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Consultation Date */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Fecha de Consulta
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consultationDate">Fecha *</Label>
                    <Input
                      id="consultationDate"
                      type="date"
                      value={formData.consultationDate}
                      onChange={(e) => setFormData({ ...formData, consultationDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultationTime">Hora *</Label>
                    <Input
                      id="consultationTime"
                      type="time"
                      value={formData.consultationTime}
                      onChange={(e) => setFormData({ ...formData, consultationTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Guardar cambios" : "Guardar paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
