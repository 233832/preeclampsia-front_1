"use client"

import { Patient, RiskLevel, getLatestConsultation } from "@/lib/patient-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Eye, Pencil, Trash2, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateInMexico } from "@/lib/mexico-time"

interface PatientsTableProps {
  patients: Patient[]
  onView: (patient: Patient) => void
  onEdit: (patient: Patient) => void
  onDelete: (id: string) => void
}

const riskConfig: Record<RiskLevel, { label: string; bgColor: string; textColor: string }> = {
  none: {
    label: "Ninguno",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
  },
  low: {
    label: "Bajo",
    bgColor: "bg-risk-low/15",
    textColor: "text-risk-low",
  },
  moderate: {
    label: "Medio",
    bgColor: "bg-risk-moderate/15",
    textColor: "text-risk-moderate",
  },
  high: {
    label: "Alto",
    bgColor: "bg-risk-high/15",
    textColor: "text-risk-high",
  },
}

function formatDate(dateString: string): string {
  return formatDateInMexico(dateString)
}

export function PatientsTable({ patients, onView, onEdit, onDelete }: PatientsTableProps) {
  if (patients.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No hay pacientes registrados
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Agregue un nuevo paciente usando el boton "Agregar Paciente" para comenzar.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Users className="h-5 w-5 text-primary" />
          Listado de Pacientes
          <Badge variant="secondary" className="ml-2">
            {patients.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Nombre</TableHead>
                <TableHead className="font-semibold text-center">Edad</TableHead>
                <TableHead className="font-semibold text-center">Sem. Gest.</TableHead>
                <TableHead className="font-semibold text-center">IMC</TableHead>
                <TableHead className="font-semibold text-center">Riesgo</TableHead>
                <TableHead className="font-semibold text-center">Consultas</TableHead>
                <TableHead className="font-semibold text-center">Ultima</TableHead>
                <TableHead className="font-semibold text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => {
                const latestConsultation = getLatestConsultation(patient)
                const risk = latestConsultation 
                  ? riskConfig[latestConsultation.riskLevel]
                  : riskConfig.none
                
                return (
                  <TableRow key={patient.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell className="text-center">{patient.age} años</TableCell>
                    <TableCell className="text-center">
                      {latestConsultation ? (
                        <Badge variant="outline" className="bg-primary/5">
                          S{latestConsultation.gestationalWeek}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {latestConsultation ? latestConsultation.bmi.toFixed(1) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("text-xs", risk.bgColor, risk.textColor)}>
                        {risk.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {patient.consultations.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {latestConsultation ? formatDate(latestConsultation.date) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => onView(patient)}
                          title="Ver en Monitoreo Clínico"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => onEdit(patient)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar eliminacion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta seguro de eliminar a {patient.name}? Se eliminaran todas sus consultas. Esta accion no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(patient.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
