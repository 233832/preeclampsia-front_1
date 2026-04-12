"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { ReporteConsulta } from "@/components/reportes/reporte-consulta"

type ReporteRouteParams = {
  consultaId?: string | string[]
}

export default function ReporteConsultaPage() {
  const params = useParams<ReporteRouteParams>()

  const consultaIdParam = useMemo(() => {
    if (!params?.consultaId) {
      return undefined
    }

    return Array.isArray(params.consultaId) ? params.consultaId[0] : params.consultaId
  }, [params])

  return (
    <div className="min-h-screen bg-background">
      <MainNav hideUtilityActions />

      <main className="container mx-auto px-4 py-6">
        <ReporteConsulta consultaIdParam={consultaIdParam} />
      </main>
    </div>
  )
}
