"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Scale, Ruler } from "lucide-react"

interface PatientData {
  name: string
  age: number
  bloodType: string | null
  gestationalWeek: number
  weight: number
  height: number
  bmi: number
}

interface PatientInfoCardProps {
  patient: PatientData
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <User className="h-5 w-5 text-primary" />
          Datos de la Paciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-col gap-1 border-b border-border/50 pb-3">
            <span className="text-xs text-muted-foreground">Nombre</span>
            <span className="font-medium text-sm truncate">{patient.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-2">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Edad
              </p>
              <p className="mt-1 text-sm font-semibold">{patient.age} años</p>
            </div>
            <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">Tipo de sangre</p>
              <p className="mt-1 text-sm font-semibold">{patient.bloodType ?? "No especificado"}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Semana Gestacion</span>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
              Sem. {patient.gestationalWeek}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
              <Scale className="h-3.5 w-3.5 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Peso</p>
              <p className="font-semibold text-sm">{patient.weight} kg</p>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
              <Ruler className="h-3.5 w-3.5 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Altura</p>
              <p className="font-semibold text-sm">{patient.height} cm</p>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-primary/10">
              <p className="text-xs text-muted-foreground">IMC</p>
              <p className="font-bold text-sm text-primary">{patient.bmi.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
