"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Save, Stethoscope } from "lucide-react"

interface DoctorMedicationCardProps {
  recomendacionDoctor: string
  incluirMedicacionSugerida: boolean
  incluirRecomendacionDoctor: boolean
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  saveError: string | null
  saveSuccess: string | null
  onRecommendationChange: (value: string) => void
  onIncluirMedicacionSugeridaChange: (checked: boolean) => void
  onIncluirRecomendacionDoctorChange: (checked: boolean) => void
  onSave: () => void
}

export function DoctorMedicationCard({
  recomendacionDoctor,
  incluirMedicacionSugerida,
  incluirRecomendacionDoctor,
  isDirty,
  isLoading,
  isSaving,
  saveError,
  saveSuccess,
  onRecommendationChange,
  onIncluirMedicacionSugeridaChange,
  onIncluirRecomendacionDoctorChange,
  onSave,
}: DoctorMedicationCardProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Stethoscope className="h-4 w-4 text-primary" />
          Medicacion del doctor
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="doctor-medication-recommendation">Recomendacion del doctor</Label>
          <Textarea
            id="doctor-medication-recommendation"
            value={recomendacionDoctor}
            onChange={(event) => onRecommendationChange(event.target.value)}
            placeholder="Escriba aqui la recomendacion clinica personalizada para esta consulta."
            className="min-h-24 resize-y"
            disabled={isLoading || isSaving}
          />
        </div>

        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Label htmlFor="toggle-incluir-medicacion">Incluir medicacion sugerida</Label>
              <p className="text-xs text-muted-foreground">
                Mostrar u ocultar la medicacion sugerida por el sistema en vista previa y PDF.
              </p>
            </div>

            <Switch
              id="toggle-incluir-medicacion"
              checked={incluirMedicacionSugerida}
              onCheckedChange={onIncluirMedicacionSugeridaChange}
              disabled={isLoading || isSaving}
            />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Label htmlFor="toggle-incluir-recomendacion">Incluir recomendacion del doctor</Label>
              <p className="text-xs text-muted-foreground">
                Mostrar u ocultar la recomendacion escrita por el doctor en vista previa y PDF.
              </p>
            </div>

            <Switch
              id="toggle-incluir-recomendacion"
              checked={incluirRecomendacionDoctor}
              onCheckedChange={onIncluirRecomendacionDoctorChange}
              disabled={isLoading || isSaving}
            />
          </div>
        </div>

        {saveSuccess && (
          <p className="rounded-lg border border-emerald-400/50 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {saveSuccess}
          </p>
        )}

        {saveError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {saveError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={onSave}
            disabled={isLoading || isSaving || !isDirty}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>

          {!isDirty && !isSaving && (
            <span className="text-xs text-muted-foreground">Sin cambios pendientes.</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
