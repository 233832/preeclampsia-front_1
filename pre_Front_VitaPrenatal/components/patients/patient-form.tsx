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
import { Patient, PatientRegistrationInput, getLatestConsultation } from "@/lib/patient-context"
import { PacienteCreateFormInput } from "@/interfaz/paciente"
import { User, MapPin, Phone, Calendar, Activity, Scale } from "lucide-react"
import { getCurrentMexicoDate, getCurrentMexicoTime } from "@/lib/mexico-time"
import { getApiErrorMessage, getApiValidationFieldErrors } from "@/servicios/apiError"

interface PatientFormProps {
  open: boolean
  onClose: () => void
  onSave: (patient: PatientRegistrationInput) => Promise<void>
  onUpdate?: (id: string, patient: PacienteCreateFormInput) => Promise<void> | void
  editingPatient?: Patient | null
  hasRegisteredConsultations?: boolean
  antecedentsLocked?: boolean
}

const maritalStatusOptions = [
  "Soltera",
  "Casada",
  "Divorciada",
  "Viuda",
  "Union libre",
]

const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

type PatientFormField =
  | "name"
  | "age"
  | "address"
  | "maritalStatus"
  | "city"
  | "phone"
  | "tipo_sangre"
  | "abortos_previos"
  | "cesarea_previos"
  | "embarazos_previos"
  | "partos_previos"
  | "previousHypertension"
  | "diabetes"
  | "familyHypertensionHistory"
  | "fam_cardiopatia"
  | "enf_renal_cronica"
  | "embarazo_multiple"
  | "muerte_fetal"
  | "restriccion_fetal"

const backendFieldToFormFieldMap: Record<string, PatientFormField> = {
  nombre: "name",
  edad: "age",
  domicilio: "address",
  estado_civil: "maritalStatus",
  ciudad: "city",
  telefono: "phone",
  tipo_sangre: "tipo_sangre",
  abortos_previos: "abortos_previos",
  cesarea_previos: "cesarea_previos",
  embarazos_previos: "embarazos_previos",
  partos_previos: "partos_previos",
  hipertension_previa: "previousHypertension",
  diabetes: "diabetes",
  antecedentes_familia_hipertension: "familyHypertensionHistory",
  fam_cardiopatia: "fam_cardiopatia",
  enf_renal_cronica: "enf_renal_cronica",
  embarazo_multiple: "embarazo_multiple",
  muerte_fetal: "muerte_fetal",
  restriccion_fetal: "restriccion_fetal",
}

function mapBackendErrorsToForm(
  fieldErrors: Record<string, string>,
): Partial<Record<PatientFormField, string>> {
  const mapped: Partial<Record<PatientFormField, string>> = {}

  for (const [backendField, message] of Object.entries(fieldErrors)) {
    const formField = backendFieldToFormFieldMap[backendField]

    if (!formField) {
      continue
    }

    mapped[formField] = message
  }

  return mapped
}

export function PatientForm({
  open,
  onClose,
  onSave,
  onUpdate,
  editingPatient,
  hasRegisteredConsultations = false,
  antecedentsLocked = false,
}: PatientFormProps) {
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
    tipo_sangre: "",
    // Consultation info
    gestationalWeek: 12,
    weight: 60,
    height: 160,
    systolic: 120,
    diastolic: 80,
    previousHypertension: false,
    diabetes: false,
    familyHypertensionHistory: false,
    fam_cardiopatia: false,
    enf_renal_cronica: false,
    abortos_previos: 0,
    cesarea_previos: 0,
    embarazos_previos: 0,
    partos_previos: 0,
    embarazo_multiple: false,
    muerte_fetal: false,
    restriccion_fetal: false,
    consultationDate: currentMexicoDate,
    consultationTime: currentMexicoTime,
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PatientFormField, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (editingPatient) {
      setFormData({
        name: editingPatient.name,
        age: editingPatient.age,
        address: editingPatient.address,
        city: editingPatient.city,
        phone: editingPatient.phone,
        maritalStatus: editingPatient.maritalStatus,
        tipo_sangre: editingPatient.tipo_sangre ?? "",
        // Use latest consultation data
        gestationalWeek: latestConsultation?.gestationalWeek ?? 12,
        weight: latestConsultation?.weight ?? 60,
        height: latestConsultation?.height ?? 160,
        systolic: latestConsultation?.systolic ?? 120,
        diastolic: latestConsultation?.diastolic ?? 80,
        previousHypertension: editingPatient.previousHypertension,
        diabetes: editingPatient.diabetes,
        familyHypertensionHistory: editingPatient.familyHypertensionHistory,
        fam_cardiopatia: editingPatient.fam_cardiopatia,
        enf_renal_cronica: editingPatient.enf_renal_cronica,
        abortos_previos: editingPatient.abortos_previos,
        cesarea_previos: editingPatient.cesarea_previos,
        embarazos_previos: editingPatient.embarazos_previos,
        partos_previos: editingPatient.partos_previos,
        embarazo_multiple: editingPatient.embarazo_multiple,
        muerte_fetal: editingPatient.muerte_fetal,
        restriccion_fetal: editingPatient.restriccion_fetal,
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
        tipo_sangre: "",
        gestationalWeek: 12,
        weight: 60,
        height: 160,
        systolic: 120,
        diastolic: 80,
        previousHypertension: false,
        diabetes: false,
        familyHypertensionHistory: false,
        fam_cardiopatia: false,
        enf_renal_cronica: false,
        abortos_previos: 0,
        cesarea_previos: 0,
        embarazos_previos: 0,
        partos_previos: 0,
        embarazo_multiple: false,
        muerte_fetal: false,
        restriccion_fetal: false,
        consultationDate: getCurrentMexicoDate(),
        consultationTime: getCurrentMexicoTime(),
      })
    }

    setFieldErrors({})
    setSubmitError(null)
  }, [editingPatient, latestConsultation, open])

  const calculatedBMI = Number((formData.weight / ((formData.height / 100) ** 2)).toFixed(1))
  const calculatedMAP = Number(((formData.systolic + (2 * formData.diastolic)) / 3).toFixed(1))

  const clearFieldError = (field: PatientFormField) => {
    if (!fieldErrors[field]) {
      return
    }

    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setSubmitError(null)

    try {
      if (editingPatient && onUpdate) {
        // Update patient with complete backend contract
        await onUpdate(editingPatient.id, {
          name: formData.name,
          age: formData.age,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          maritalStatus: formData.maritalStatus,
          tipo_sangre: formData.tipo_sangre,
          previousHypertension: formData.previousHypertension,
          diabetes: formData.diabetes,
          familyHypertensionHistory: formData.familyHypertensionHistory,
          fam_cardiopatia: formData.fam_cardiopatia,
          enf_renal_cronica: formData.enf_renal_cronica,
          embarazo_multiple: formData.embarazo_multiple,
          muerte_fetal: formData.muerte_fetal,
          restriccion_fetal: formData.restriccion_fetal,
          abortos_previos: formData.abortos_previos,
          cesarea_previos: formData.cesarea_previos,
          embarazos_previos: formData.embarazos_previos,
          partos_previos: formData.partos_previos,
        })
      } else {
        // Create new patient with first consultation
        await onSave({
          name: formData.name,
          age: formData.age,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          maritalStatus: formData.maritalStatus,
          tipo_sangre: formData.tipo_sangre,
          previousHypertension: formData.previousHypertension,
          diabetes: formData.diabetes,
          familyHypertensionHistory: formData.familyHypertensionHistory,
          fam_cardiopatia: formData.fam_cardiopatia,
          enf_renal_cronica: formData.enf_renal_cronica,
          embarazo_multiple: formData.embarazo_multiple,
          muerte_fetal: formData.muerte_fetal,
          restriccion_fetal: formData.restriccion_fetal,
          abortos_previos: formData.abortos_previos,
          cesarea_previos: formData.cesarea_previos,
          embarazos_previos: formData.embarazos_previos,
          partos_previos: formData.partos_previos,
          consultation: {
            date: formData.consultationDate,
            time: formData.consultationTime,
            gestationalWeek: formData.gestationalWeek,
            weight: formData.weight,
            height: formData.height,
            systolic: formData.systolic,
            diastolic: formData.diastolic,
            pam: calculatedMAP,
            previousHypertension: formData.previousHypertension,
            diabetes: formData.diabetes,
            familyHypertensionHistory: formData.familyHypertensionHistory,
          }
        })
      }

      onClose()
    } catch (error) {
      const apiFieldErrors = getApiValidationFieldErrors(error)
      const mappedErrors = mapBackendErrorsToForm(apiFieldErrors)

      if (Object.keys(mappedErrors).length > 0) {
        setFieldErrors(mappedErrors)
        setSubmitError("Revise los campos marcados e intente nuevamente.")
        return
      }

      setSubmitError(getApiErrorMessage(error))
    }
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
          {submitError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {submitError}
            </div>
          )}

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Informacion del Paciente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    clearFieldError("name")
                    setFormData({ ...formData, name: e.target.value })
                  }}
                  placeholder="Nombre completo de la paciente"
                  required
                />
                {fieldErrors.name && (
                  <p className="text-xs text-destructive">{fieldErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Edad *</Label>
                <Input
                  id="age"
                  type="number"
                  min={15}
                  max={55}
                  value={formData.age}
                  onChange={(e) => {
                    clearFieldError("age")
                    setFormData({ ...formData, age: Number(e.target.value) })
                  }}
                  required
                />
                {fieldErrors.age && (
                  <p className="text-xs text-destructive">{fieldErrors.age}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Estado civil *</Label>
                <select
                  id="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={(event) => {
                    clearFieldError("maritalStatus")
                    setFormData({ ...formData, maritalStatus: event.target.value })
                  }}
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
                {fieldErrors.maritalStatus && (
                  <p className="text-xs text-destructive">{fieldErrors.maritalStatus}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    clearFieldError("phone")
                    setFormData({ ...formData, phone: e.target.value })
                  }}
                  placeholder="555-1234567"
                  required
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_sangre">Tipo de sangre</Label>
                <select
                  id="tipo_sangre"
                  value={formData.tipo_sangre}
                  onChange={(event) => {
                    clearFieldError("tipo_sangre")
                    setFormData({ ...formData, tipo_sangre: event.target.value })
                  }}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50"
                >
                  <option value="">No especificado</option>
                  {bloodTypeOptions.map((bloodType) => (
                    <option key={bloodType} value={bloodType}>
                      {bloodType}
                    </option>
                  ))}
                </select>
                {fieldErrors.tipo_sangre && (
                  <p className="text-xs text-destructive">{fieldErrors.tipo_sangre}</p>
                )}
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
                  onChange={(e) => {
                    clearFieldError("address")
                    setFormData({ ...formData, address: e.target.value })
                  }}
                  placeholder="Calle, numero, colonia"
                  required
                />
                {fieldErrors.address && (
                  <p className="text-xs text-destructive">{fieldErrors.address}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => {
                    clearFieldError("city")
                    setFormData({ ...formData, city: e.target.value })
                  }}
                  placeholder="Ciudad"
                  required
                />
                {fieldErrors.city && (
                  <p className="text-xs text-destructive">{fieldErrors.city}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">ANTECEDENTES</h3>
                {antecedentsLocked && hasRegisteredConsultations && (
                  <div className="rounded-md border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Los antecedentes no pueden modificarse después de registrar una consulta.
                  </div>
                )}
                <div className="space-y-4">
                  <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Heredo-familiares</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="fam_cardiopatia_edit" className="cursor-pointer">
                          Cardiopatia familiar
                        </Label>
                        <Checkbox
                          id="fam_cardiopatia_edit"
                          checked={formData.fam_cardiopatia}
                          disabled={antecedentsLocked}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              fam_cardiopatia: checked === true,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="antecedentes_familia_hipertension_edit" className="cursor-pointer">
                          Antecedentes familiares de hipertension
                        </Label>
                        <Checkbox
                          id="antecedentes_familia_hipertension_edit"
                          checked={formData.familyHypertensionHistory}
                          disabled={antecedentsLocked}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, familyHypertensionHistory: checked === true })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Personales patologicos</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="enf_renal_cronica_edit" className="cursor-pointer">
                          Enfermedad renal cronica
                        </Label>
                        <Checkbox
                          id="enf_renal_cronica_edit"
                          checked={formData.enf_renal_cronica}
                          disabled={antecedentsLocked}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, enf_renal_cronica: checked === true })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="hipertension_previa_edit" className="cursor-pointer">
                          Hipertension previa
                        </Label>
                        <Checkbox
                          id="hipertension_previa_edit"
                          checked={formData.previousHypertension}
                          disabled={antecedentsLocked}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, previousHypertension: checked === true })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="diabetes_edit" className="cursor-pointer">
                          Diabetes
                        </Label>
                        <Checkbox
                          id="diabetes_edit"
                          checked={formData.diabetes}
                          disabled={antecedentsLocked}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, diabetes: checked === true })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Ginecoobstetricos</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="abortos_previos_edit">Abortos previos</Label>
                        <Input
                          id="abortos_previos_edit"
                          type="number"
                          min={0}
                          disabled={antecedentsLocked}
                          value={formData.abortos_previos}
                          onChange={(e) => {
                            clearFieldError("abortos_previos")
                            setFormData({
                              ...formData,
                              abortos_previos: Math.max(0, Number(e.target.value) || 0),
                            })
                          }}
                        />
                        {fieldErrors.abortos_previos && (
                          <p className="text-xs text-destructive">{fieldErrors.abortos_previos}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cesarea_previos_edit">Cesareas previas</Label>
                        <Input
                          id="cesarea_previos_edit"
                          type="number"
                          min={0}
                          disabled={antecedentsLocked}
                          value={formData.cesarea_previos}
                          onChange={(e) => {
                            clearFieldError("cesarea_previos")
                            setFormData({
                              ...formData,
                              cesarea_previos: Math.max(0, Number(e.target.value) || 0),
                            })
                          }}
                        />
                        {fieldErrors.cesarea_previos && (
                          <p className="text-xs text-destructive">{fieldErrors.cesarea_previos}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="embarazos_previos_edit">Embarazos previos</Label>
                        <Input
                          id="embarazos_previos_edit"
                          type="number"
                          min={0}
                          disabled={antecedentsLocked}
                          value={formData.embarazos_previos}
                          onChange={(e) => {
                            clearFieldError("embarazos_previos")
                            setFormData({
                              ...formData,
                              embarazos_previos: Math.max(0, Number(e.target.value) || 0),
                            })
                          }}
                        />
                        {fieldErrors.embarazos_previos && (
                          <p className="text-xs text-destructive">{fieldErrors.embarazos_previos}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="partos_previos_edit">Partos previos</Label>
                        <Input
                          id="partos_previos_edit"
                          type="number"
                          min={0}
                          disabled={antecedentsLocked}
                          value={formData.partos_previos}
                          onChange={(e) => {
                            clearFieldError("partos_previos")
                            setFormData({
                              ...formData,
                              partos_previos: Math.max(0, Number(e.target.value) || 0),
                            })
                          }}
                        />
                        {fieldErrors.partos_previos && (
                          <p className="text-xs text-destructive">{fieldErrors.partos_previos}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Otros</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="embarazo_multiple_edit" className="cursor-pointer">
                          Embarazo multiple
                        </Label>
                        <Checkbox
                          id="embarazo_multiple_edit"
                          checked={formData.embarazo_multiple}
                          disabled={antecedentsLocked}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, embarazo_multiple: checked === true })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="muerte_fetal_edit" className="cursor-pointer">
                          Muerte fetal
                        </Label>
                        <Checkbox
                          id="muerte_fetal_edit"
                          checked={formData.muerte_fetal}
                          disabled={antecedentsLocked}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, muerte_fetal: checked === true })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="restriccion_fetal_edit" className="cursor-pointer">
                          Restriccion fetal
                        </Label>
                        <Checkbox
                          id="restriccion_fetal_edit"
                          checked={formData.restriccion_fetal}
                          disabled={antecedentsLocked}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, restriccion_fetal: checked === true })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border border-primary/20 bg-primary/10 text-center">
                    <p className="text-xs text-muted-foreground">IMC Calculado</p>
                    <p className="text-lg font-bold text-primary">{calculatedBMI}</p>
                    <p className="text-[11px] text-muted-foreground">Valor automatico no editable</p>
                  </div>
                  <div className="p-3 rounded-lg border border-primary/20 bg-primary/10 text-center">
                    <p className="text-xs text-muted-foreground">Presion Arterial Media (PAM)</p>
                    <p className="text-lg font-bold text-primary">{calculatedMAP} mmHg</p>
                    <p className="text-[11px] text-muted-foreground">PAM = (PS + (2 x PD)) / 3</p>
                  </div>
                </div>
              </div>

              {/* Antecedents */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">ANTECEDENTES</h3>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Heredo-familiares</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="fam_cardiopatia" className="cursor-pointer">
                          Cardiopatia familiar
                        </Label>
                        <Checkbox
                          id="fam_cardiopatia"
                          checked={formData.fam_cardiopatia}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              fam_cardiopatia: checked === true,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="antecedentes_familia_hipertension" className="cursor-pointer">
                          Antecedentes familiares de hipertension
                        </Label>
                        <Checkbox
                          id="antecedentes_familia_hipertension"
                          checked={formData.familyHypertensionHistory}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              familyHypertensionHistory: checked === true,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Personales patologicos</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="enf_renal_cronica" className="cursor-pointer">
                          Enfermedad renal cronica
                        </Label>
                        <Checkbox
                          id="enf_renal_cronica"
                          checked={formData.enf_renal_cronica}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, enf_renal_cronica: checked === true })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="hipertension_previa" className="cursor-pointer">
                          Hipertension previa
                        </Label>
                        <Checkbox
                          id="hipertension_previa"
                          checked={formData.previousHypertension}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, previousHypertension: checked === true })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="diabetes" className="cursor-pointer">
                          Diabetes
                        </Label>
                        <Checkbox
                          id="diabetes"
                          checked={formData.diabetes}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, diabetes: checked === true })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Ginecoobstetricos</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="abortos_previos">Abortos previos</Label>
                        <Input
                          id="abortos_previos"
                          type="number"
                          min={0}
                          value={formData.abortos_previos}
                          onChange={(e) => {
                            clearFieldError("abortos_previos")
                            setFormData({
                              ...formData,
                              abortos_previos: Math.max(0, Number(e.target.value) || 0),
                            })
                          }}
                        />
                        {fieldErrors.abortos_previos && (
                          <p className="text-xs text-destructive">{fieldErrors.abortos_previos}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cesarea_previos">Cesareas previas</Label>
                        <Input
                          id="cesarea_previos"
                          type="number"
                          min={0}
                          value={formData.cesarea_previos}
                          onChange={(e) => {
                            clearFieldError("cesarea_previos")
                            setFormData({
                              ...formData,
                              cesarea_previos: Math.max(0, Number(e.target.value) || 0),
                            })
                          }}
                        />
                        {fieldErrors.cesarea_previos && (
                          <p className="text-xs text-destructive">{fieldErrors.cesarea_previos}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="embarazos_previos">Embarazos previos</Label>
                        <Input
                          id="embarazos_previos"
                          type="number"
                          min={0}
                          value={formData.embarazos_previos}
                          onChange={(e) => {
                            clearFieldError("embarazos_previos")
                            setFormData({
                              ...formData,
                              embarazos_previos: Math.max(0, Number(e.target.value) || 0),
                            })
                          }}
                        />
                        {fieldErrors.embarazos_previos && (
                          <p className="text-xs text-destructive">{fieldErrors.embarazos_previos}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="partos_previos">Partos previos</Label>
                        <Input
                          id="partos_previos"
                          type="number"
                          min={0}
                          value={formData.partos_previos}
                          onChange={(e) => {
                            clearFieldError("partos_previos")
                            setFormData({
                              ...formData,
                              partos_previos: Math.max(0, Number(e.target.value) || 0),
                            })
                          }}
                        />
                        {fieldErrors.partos_previos && (
                          <p className="text-xs text-destructive">{fieldErrors.partos_previos}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Otros</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="embarazo_multiple" className="cursor-pointer">
                          Embarazo multiple
                        </Label>
                        <Checkbox
                          id="embarazo_multiple"
                          checked={formData.embarazo_multiple}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, embarazo_multiple: checked === true })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="muerte_fetal" className="cursor-pointer">
                          Muerte fetal
                        </Label>
                        <Checkbox
                          id="muerte_fetal"
                          checked={formData.muerte_fetal}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, muerte_fetal: checked === true })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                        <Label htmlFor="restriccion_fetal" className="cursor-pointer">
                          Restriccion fetal
                        </Label>
                        <Checkbox
                          id="restriccion_fetal"
                          checked={formData.restriccion_fetal}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, restriccion_fetal: checked === true })
                          }
                        />
                      </div>
                    </div>
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
