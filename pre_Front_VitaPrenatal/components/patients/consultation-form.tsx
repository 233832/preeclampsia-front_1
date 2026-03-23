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
import { Patient, Consultation } from "@/lib/patient-context"
import { Activity, Calendar, Scale } from "lucide-react"

interface ConsultationFormProps {
  open: boolean
  onClose: () => void
  patient: Patient
  onSave: (consultation: Omit<Consultation, "id" | "bmi" | "riskLevel" | "riskProbability">) => void
}

export function ConsultationForm({ open, onClose, patient, onSave }: ConsultationFormProps) {
  // Get the latest consultation to pre-fill some values
  const latestConsultation = patient.consultations.length > 0
    ? patient.consultations.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })[0]
    : null

  const [formData, setFormData] = useState({
    gestationalWeek: latestConsultation ? latestConsultation.gestationalWeek + 2 : 12,
    weight: latestConsultation?.weight ?? 60,
    height: latestConsultation?.height ?? 160,
    systolic: 120,
    diastolic: 80,
    previousHypertension: latestConsultation?.previousHypertension ?? false,
    diabetes: latestConsultation?.diabetes ?? false,
    familyHypertensionHistory: latestConsultation?.familyHypertensionHistory ?? false,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
  })

  useEffect(() => {
    if (open && latestConsultation) {
      setFormData({
        gestationalWeek: Math.min(latestConsultation.gestationalWeek + 2, 42),
        weight: latestConsultation.weight,
        height: latestConsultation.height,
        systolic: 120,
        diastolic: 80,
        previousHypertension: latestConsultation.previousHypertension,
        diabetes: latestConsultation.diabetes,
        familyHypertensionHistory: latestConsultation.familyHypertensionHistory,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
      })
    }
  }, [open, latestConsultation])

  const calculatedBMI = (formData.weight / ((formData.height / 100) ** 2)).toFixed(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
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
            <div className="p-2.5 rounded-lg bg-primary/10 text-center">
              <p className="text-xs text-muted-foreground">IMC Calculado</p>
              <p className="text-lg font-bold text-primary">{calculatedBMI}</p>
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

          {/* Medical History */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Antecedentes Medicos</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <Label htmlFor="previousHypertension" className="cursor-pointer text-sm">
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
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <Label htmlFor="diabetes" className="cursor-pointer text-sm">
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
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <Label htmlFor="familyHistory" className="cursor-pointer text-sm">
                  Antecedentes familiares HTA
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
