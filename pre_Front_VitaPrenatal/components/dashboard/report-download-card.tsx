"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, FileDown } from "lucide-react"
import Link from "next/link"

interface ReportDownloadCardProps {
  consultationId?: string
  isAvailable: boolean
  onDownloadReport: (consultationId: string) => void
  downloadingConsultationId?: string | null
}

export function ReportDownloadCard({
  consultationId,
  isAvailable,
  onDownloadReport,
  downloadingConsultationId,
}: ReportDownloadCardProps) {
  const canDownload = !!consultationId
  const isOpeningCurrent = consultationId && downloadingConsultationId === consultationId

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Reporte de Consulta
          </CardTitle>
          <Badge variant={isAvailable ? "default" : "secondary"}>
            {isAvailable ? "Disponible" : "Pendiente"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isAvailable
            ? "Reporte clinico disponible"
            : "Disponible cuando exista interpretacion clinica de la consulta."}
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            className="w-full gap-2"
            disabled={!canDownload}
            onClick={() => {
              if (consultationId) {
                onDownloadReport(consultationId)
              }
            }}
          >
            <FileDown className="h-4 w-4" />
            {isOpeningCurrent ? "Abriendo..." : "Descargar PDF"}
          </Button>

          {consultationId ? (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/reportes/${consultationId}`}>Ver vista previa</Link>
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              Ver vista previa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
