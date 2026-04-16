"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConsultationCreateInput, Patient } from "@/lib/patient-context"
import { Activity, Calendar, Scale } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentMexicoDate, getCurrentMexicoTime, getDateTimeSortKey } from "@/lib/mexico-time"

interface ConsultationFormProps {
  open: boolean
  onClose: () => void
  patient: Patient
  onSave: (consultation: ConsultationCreateInput) => Promise<void>
}

export function ConsultationForm({ open, onClose, patient, onSave }: ConsultationFormProps) {
  // Get the latest consultation to pre-fill some values
  const latestConsultation = patient.consultations.length > 0
    ? [...patient.consultations].sort((a, b) => {
        return getDateTimeSortKey(b.date, b.time).localeCompare(getDateTimeSortKey(a.date, a.time))
      })[0]
    : null

  const currentMexicoDate = getCurrentMexicoDate()
  const currentMexicoTime = getCurrentMexicoTime()

  const [formData, setFormData] = useState({
    gestationalWeek: latestConsultation ? latestConsultation.gestationalWeek + 2 : 12,
    weight: latestConsultation?.weight ?? 60,
    height: latestConsultation?.height ?? 160,
    systolic: 120,
    diastolic: 80,
    previousHypertension: patient.previousHypertension,
    diabetes: patient.diabetes,
    familyHypertensionHistory: patient.familyHypertensionHistory,
    date: currentMexicoDate,
    time: currentMexicoTime,
  })

  useEffect(() => {
    if (open) {
      setFormData({
        gestationalWeek: latestConsultation ? Math.min(latestConsultation.gestationalWeek + 2, 42) : 12,
        weight: latestConsultation?.weight ?? 60,
        height: latestConsultation?.height ?? 160,
        systolic: 120,
        diastolic: 80,
        previousHypertension: patient.previousHypertension,
        diabetes: patient.diabetes,
        familyHypertensionHistory: patient.familyHypertensionHistory,
        date: getCurrentMexicoDate(),
        time: getCurrentMexicoTime(),
      })
    }
  }, [open, latestConsultation, patient])

  const calculatedBMI = Number((formData.weight / ((formData.height / 100) ** 2)).toFixed(1))
  const calculatedMAP = Number(((formData.systolic + (2 * formData.diastolic)) / 3).toFixed(1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Extraer solo los datos clínicos de la consulta y enviar PAM explícitamente.
    const { previousHypertension, diabetes, familyHypertensionHistory, ...consultationData } = formData

    try {
      await onSave({
        ...consultationData,
        pam: calculatedMAP,
      })
      onClose()
    } catch {
      // El manejo visual del error ocurre en el contenedor padre.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Nueva Consulta
          </DialogTitle>
          <DialogDescription>
            Registrar nueva consulta para {patient.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date and Time */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Fecha y Hora
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time" className="text-xs">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Medical Measurements */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Mediciones
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="gestationalWeek" className="text-xs">Sem. Gestacion *</Label>
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
              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-xs">Peso (kg) *</Label>
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
              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-xs">Altura (cm) *</Label>
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

          {/* Clinical Indicators */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Indicadores Clinicos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                <Label htmlFor="imc" className="text-xs">IMC *</Label>
                <Input
                  id="imc"
                  type="number"
                  value={calculatedBMI}
                  readOnly
                  className="mt-1 text-center font-bold text-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Valor calculado automaticamente</p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                <Label htmlFor="pam" className="text-xs">PAM *</Label>
                <Input
                  id="pam"
                  type="number"
                  value={calculatedMAP}
                  readOnly
                  className="mt-1 text-center font-bold text-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">PAM = (PS + (2 x PD)) / 3</p>
              </div>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              Presion Arterial
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="systolic" className="text-xs">Sistolica (mmHg) *</Label>
                <Input
                  id="systolic"
                  type="number"
                  min={70}
                  max={200}
                  value={formData.systolic}
                  onChange={(e) => setFormData({ ...formData, systolic: Number(e.target.value) })}
                  className="text-center font-semibold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="diastolic" className="text-xs">Diastolica (mmHg) *</Label>
                <Input
                  id="diastolic"
                  type="number"
                  min={40}
                  max={130}
                  value={formData.diastolic}
                  onChange={(e) => setFormData({ ...formData, diastolic: Number(e.target.value) })}
                  className="text-center font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Medical History - Read Only */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              📋 Información del Paciente (No Editable)
            </h3>
            <div className="p-3 rounded-lg bg-muted/30 border border-muted">
              <p className="text-xs text-muted-foreground mb-3">
                Estos antecedentes médicos pertenecen al perfil del paciente y no pueden modificarse desde una consulta.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
                  <span className="text-sm text-foreground">Hipertensión previa</span>
                  <span className={cn(
                    "text-sm font-medium px-2 py-1 rounded",
                    formData.previousHypertension
                      ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  )}>
                    {formData.previousHypertension ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
                  <span className="text-sm text-foreground">Diabetes</span>
                  <span className={cn(
                    "text-sm font-medium px-2 py-1 rounded",
                    formData.diabetes
                      ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  )}>
                    {formData.diabetes ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
                  <span className="text-sm text-foreground">Antecedentes familiares HTA</span>
                  <span className={cn(
                    "text-sm font-medium px-2 py-1 rounded",
                    formData.familyHypertensionHistory
                      ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  )}>
                    {formData.familyHypertensionHistory ? "Sí" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar consulta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
