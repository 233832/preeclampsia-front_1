import { ConfiguracionesClinicas } from "@/interfaz/configuracion"

const CONFIGURACIONES_STORAGE_KEY = "vitaprenatal_configuraciones"

export async function getConfiguraciones(): Promise<ConfiguracionesClinicas | null> {
  if (typeof window === "undefined") {
    return null
  }

  const stored = window.localStorage.getItem(CONFIGURACIONES_STORAGE_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as ConfiguracionesClinicas
  } catch (error) {
    console.warn("No se pudo leer la configuración guardada", error)
    return null
  }
}

export async function updateConfiguraciones(
  configuraciones: ConfiguracionesClinicas,
): Promise<ConfiguracionesClinicas> {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      CONFIGURACIONES_STORAGE_KEY,
      JSON.stringify(configuraciones),
    )
  }

  return configuraciones
}