export interface ConfiguracionesPayload {
  umbral_sistolico: number
  umbral_diastolico: number
  criticas: boolean
  advertencias: boolean
  informativas: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
const CONFIGURACIONES_ENDPOINT = `${API_BASE_URL}/configuraciones`

async function parseResponse(response: Response): Promise<ConfiguracionesPayload> {
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }

  return (await response.json()) as ConfiguracionesPayload
}

export async function getConfiguraciones(): Promise<ConfiguracionesPayload> {
  const response = await fetch(CONFIGURACIONES_ENDPOINT, {
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
  const response = await fetch(CONFIGURACIONES_ENDPOINT, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  })

  return parseResponse(response)
}
