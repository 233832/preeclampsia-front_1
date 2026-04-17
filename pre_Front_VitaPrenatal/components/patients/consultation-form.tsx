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
        date: getCurrentMexicoDate(),
        time: getCurrentMexicoTime(),
      })
    }
  }, [open, latestConsultation, patient])

  const calculatedBMI = Number((formData.weight / ((formData.height / 100) ** 2)).toFixed(1))
  const calculatedMAP = Number(((formData.systolic + (2 * formData.diastolic)) / 3).toFixed(1))

  const parseIntegerInput = (rawValue: string): number => {
    const onlyDigits = rawValue.replace(/\D/g, "")
    return onlyDigits ? Number(onlyDigits) : 0
  }

  const parseDecimalInput = (rawValue: string): number => {
    const normalized = rawValue
      .replace(",", ".")
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1")

    if (!normalized || normalized === ".") {
      return 0
    }

    return Number(normalized)
  }

  const antecedentBooleanItems = [
    { label: "Hipertension previa", value: patient.previousHypertension },
    { label: "Diabetes", value: patient.diabetes },
    { label: "Antecedentes familiares HTA", value: patient.familyHypertensionHistory },
    { label: "Cardiopatia familiar", value: patient.fam_cardiopatia },
    { label: "Enfermedad renal cronica", value: patient.enf_renal_cronica },
    { label: "Embarazo multiple", value: patient.embarazo_multiple },
    { label: "Muerte fetal", value: patient.muerte_fetal },
    { label: "Restriccion fetal", value: patient.restriccion_fetal },
  ]

  const antecedentNumericItems = [
    { label: "Abortos previos", value: patient.abortos_previos },
    { label: "Cesareas previas", value: patient.cesarea_previos },
    { label: "Embarazos previos", value: patient.embarazos_previos },
    { label: "Partos previos", value: patient.partos_previos },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await onSave({
        ...formData,
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.gestationalWeek === 0 ? "" : String(formData.gestationalWeek)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gestationalWeek: Math.min(parseIntegerInput(e.target.value), 42),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-xs">Peso (kg) *</Label>
                <Input
                  id="weight"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={formData.weight === 0 ? "" : String(formData.weight)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: Math.min(parseDecimalInput(e.target.value), 200),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-xs">Altura (cm) *</Label>
                <Input
                  id="height"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.height === 0 ? "" : String(formData.height)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: Math.min(parseIntegerInput(e.target.value), 220),
                    })
                  }
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
                  type="text"
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
                  type="text"
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.systolic === 0 ? "" : String(formData.systolic)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      systolic: Math.min(parseIntegerInput(e.target.value), 200),
                    })
                  }
                  className="text-center font-semibold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="diastolic" className="text-xs">Diastolica (mmHg) *</Label>
                <Input
                  id="diastolic"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.diastolic === 0 ? "" : String(formData.diastolic)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diastolic: Math.min(parseIntegerInput(e.target.value), 130),
                    })
                  }
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
              <div className="space-y-3">
                {antecedentBooleanItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span
                      className={cn(
                        "text-sm font-medium px-2 py-1 rounded",
                        item.value
                          ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                      )}
                    >
                      {item.value ? "Si" : "No"}
                    </span>
                  </div>
                ))}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {antecedentNumericItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
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
