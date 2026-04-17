import axios from "axios"
import type { MedicacionResponse } from "@/interfaz/medicacion"
import {
  getMedicacionEndpointRiskSegment,
  getMedicamentosAliasRiskSegment,
  normalizeMedicacionRisk,
} from "@/lib/medicacion-risk-normalization"
import { axiosClient } from "@/servicios/axiosClient"

export class MedicacionServiceError extends Error {
  status?: number
  invalidRisk: boolean

  constructor(message: string, options?: { status?: number; invalidRisk?: boolean }) {
    super(message)
    this.name = "MedicacionServiceError"
    this.status = options?.status
    this.invalidRisk = options?.invalidRisk ?? false
  }
}

function extractBackendMessage(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim()
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>

    if (typeof record.message === "string" && record.message.trim()) {
      return record.message.trim()
    }

    if (typeof record.detail === "string" && record.detail.trim()) {
      return record.detail.trim()
    }
  }

  return null
}

function ensureMedicacionPayload(payload: unknown): MedicacionResponse {
  if (!payload || typeof payload !== "object") {
    throw new MedicacionServiceError("Respuesta invalida del servicio de medicacion")
  }

  const record = payload as Record<string, unknown>

  if (!Array.isArray(record.detalle) || typeof record.estado !== "string") {
    const message = extractBackendMessage(payload)

    if (message) {
      throw new MedicacionServiceError(message, { invalidRisk: true })
    }

    throw new MedicacionServiceError("Respuesta invalida del servicio de medicacion")
  }

  return payload as MedicacionResponse
}

function mapRequestError(error: unknown): MedicacionServiceError {
  if (!axios.isAxiosError(error)) {
    if (error instanceof MedicacionServiceError) {
      return error
    }

    if (error instanceof Error) {
      return new MedicacionServiceError(error.message)
    }

    return new MedicacionServiceError("Error inesperado al obtener medicacion")
  }

  const status = error.response?.status
  const backendMessage = extractBackendMessage(error.response?.data)

  if (!status) {
    return new MedicacionServiceError("No se pudo conectar al servidor")
  }

  if (status === 401) {
    return new MedicacionServiceError("Sesion expirada o no autenticada", { status })
  }

  if (status === 400 || status === 422) {
    return new MedicacionServiceError(backendMessage ?? "Riesgo invalido", {
      status,
      invalidRisk: true,
    })
  }

  if (status === 404) {
    return new MedicacionServiceError(backendMessage ?? "Recurso no encontrado", { status })
  }

  return new MedicacionServiceError(
    backendMessage ?? `Error al obtener medicacion (HTTP ${status})`,
    { status },
  )
}

async function fetchFromEndpoint(path: string): Promise<MedicacionResponse> {
  const response = await axiosClient.get(path)
  return ensureMedicacionPayload(response.data)
}

export async function getMedicacionPorRiesgo(riesgo: string): Promise<MedicacionResponse> {
  const { canonicalRisk } = normalizeMedicacionRisk(riesgo)

  if (!canonicalRisk) {
    throw new MedicacionServiceError(
      "Riesgo invalido. Use NINGUNO, MEDIO, ALTO o HOSPITALIZACION.",
      { invalidRisk: true },
    )
  }

  const medicacionPath = `/api/medicacion/${encodeURIComponent(
    getMedicacionEndpointRiskSegment(canonicalRisk),
  )}`
  const medicamentosAliasPath = `/api/medicamentos/${encodeURIComponent(
    getMedicamentosAliasRiskSegment(canonicalRisk),
  )}`

  try {
    return await fetchFromEndpoint(medicacionPath)
  } catch (error) {
    const mappedPrimaryError = mapRequestError(error)

    if (mappedPrimaryError.status === 401) {
      throw mappedPrimaryError
    }

    try {
      return await fetchFromEndpoint(medicamentosAliasPath)
    } catch (aliasError) {
      throw mapRequestError(aliasError)
    }
  }
}
