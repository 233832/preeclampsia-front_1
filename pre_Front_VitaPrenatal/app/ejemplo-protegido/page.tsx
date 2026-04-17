"use client"

import axios from "axios"
import { useState } from "react"
import { MainNav } from "@/components/navigation/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { axiosClient } from "@/servicios/axiosClient"

const SAMPLE_PACIENTE_PAYLOAD = {
  nombre: "Paciente Demo Auth",
  edad: 29,
  domicilio: "Calle Clinica 123",
  estado_civil: "Soltera",
  ciudad: "Puebla",
  telefono: "2221234567",
  tipo_sangre: "O+",
  abortos_previos: 0,
  cesarea_previos: 0,
  embarazos_previos: 1,
  partos_previos: 0,
  hipertension_previa: false,
  diabetes: false,
  antecedentes_familia_hipertension: false,
  fam_cardiopatia: false,
  enf_renal_cronica: false,
  embarazo_multiple: false,
  muerte_fetal: false,
  restriccion_fetal: false,
}

function mapErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "No se pudo conectar al servidor"
  }

  const status = error.response?.status

  if (!status) {
    return "No se pudo conectar al servidor"
  }

  if (status === 401) {
    return "Sesion expirada o no autenticada"
  }

  if (status === 422) {
    return "Datos invalidos"
  }

  return `Error HTTP ${status}`
}

export default function EjemploProtegidoPage() {
  const [hospitalizacionResponse, setHospitalizacionResponse] = useState<string>("")
  const [pacienteResponse, setPacienteResponse] = useState<string>("")
  const [pacientePayload, setPacientePayload] = useState<string>(
    JSON.stringify(SAMPLE_PACIENTE_PAYLOAD, null, 2),
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loadingHospitalizacion, setLoadingHospitalizacion] = useState(false)
  const [loadingPaciente, setLoadingPaciente] = useState(false)

  const handleGetHospitalizacion = async () => {
    setLoadingHospitalizacion(true)
    setErrorMessage(null)

    try {
      const response = await axiosClient.get("/api/medicacion/hospitalizacion")
      setHospitalizacionResponse(JSON.stringify(response.data, null, 2))
    } catch (error) {
      setErrorMessage(mapErrorMessage(error))
      setHospitalizacionResponse("")
    } finally {
      setLoadingHospitalizacion(false)
    }
  }

  const handlePostPaciente = async () => {
    setLoadingPaciente(true)
    setErrorMessage(null)

    try {
      const parsedPayload = JSON.parse(pacientePayload) as Record<string, unknown>
      const response = await axiosClient.post("/api/pacientes/", parsedPayload)
      setPacienteResponse(JSON.stringify(response.data, null, 2))
    } catch (error) {
      if (error instanceof SyntaxError) {
        setErrorMessage("Datos invalidos")
      } else {
        setErrorMessage(mapErrorMessage(error))
      }
      setPacienteResponse("")
    } finally {
      setLoadingPaciente(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto space-y-6 px-4 py-6">
        <section>
          <h1 className="text-2xl font-semibold text-foreground">Ejemplo de Endpoints Protegidos</h1>
          <p className="text-sm text-muted-foreground">
            Esta pantalla prueba autenticacion real contra backend con cookie HttpOnly y Bearer token.
          </p>
        </section>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>GET /api/medicacion/hospitalizacion</CardTitle>
            <CardDescription>
              Consulta recurso protegido para confirmar sesion activa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGetHospitalizacion} disabled={loadingHospitalizacion}>
              {loadingHospitalizacion ? "Consultando..." : "Ejecutar GET protegido"}
            </Button>
            <pre className="max-h-72 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
              {hospitalizacionResponse || "Sin respuesta aun"}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>POST /api/pacientes/</CardTitle>
            <CardDescription>
              Crea un paciente usando un payload editable para pruebas de autenticacion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={pacientePayload}
              onChange={(event) => setPacientePayload(event.target.value)}
              className="min-h-[220px] w-full rounded-lg border border-input bg-background p-3 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <Button onClick={handlePostPaciente} disabled={loadingPaciente}>
              {loadingPaciente ? "Enviando..." : "Ejecutar POST protegido"}
            </Button>
            <pre className="max-h-72 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
              {pacienteResponse || "Sin respuesta aun"}
            </pre>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
