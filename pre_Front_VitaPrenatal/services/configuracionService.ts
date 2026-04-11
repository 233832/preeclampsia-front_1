import { fetchApi } from "@/servicios/apiClient"

export interface ConfiguracionesPayload extends Record<string, unknown> {
  umbral_sistolico: number
  umbral_diastolico: number
  notificaciones_activas?: boolean
  criticas: boolean
  advertencias: boolean
  informativas: boolean
  frecuencia_bajo?: number
  frecuencia_medio?: number
  frecuencia_alto?: number
  seguimiento_riesgo_bajo_dias?: number
  seguimiento_riesgo_medio_dias?: number
  seguimiento_riesgo_alto_dias?: number
  nombre_sistema?: string
  version?: string
  version_sistema?: string
  descripcion?: string
  descripcion_sistema?: string
}

const CONFIGURACIONES_ENDPOINT = "/api/configuraciones"

async function parseResponse(response: Response): Promise<ConfiguracionesPayload> {
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Respuesta inválida al obtener configuraciones")
  }

  return data as ConfiguracionesPayload
}

export async function getConfiguraciones(): Promise<ConfiguracionesPayload> {
  const response = await fetchApi(CONFIGURACIONES_ENDPOINT, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  })

  return parseResponse(response)
}

export async function updateConfiguraciones(
  data: ConfiguracionesPayload,
): Promise<ConfiguracionesPayload> {
  const response = await fetchApi(CONFIGURACIONES_ENDPOINT, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  })

  return parseResponse(response)
}
