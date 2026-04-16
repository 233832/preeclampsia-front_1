export type NormalizedRisk = "NINGUNO" | "MEDIO" | "ALTO" | "HOSPITALIZACION"

function normalizeRiskText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
}

export function normalizeClinicalRisk(value: string | null | undefined): NormalizedRisk {
  const normalized = normalizeRiskText(value ?? "")

  if (!normalized) {
    return "NINGUNO"
  }

  if (
    normalized === "NINGUNO" ||
    normalized === "NONE" ||
    normalized === "SIN RIESGO" ||
    normalized === "NO RIESGO" ||
    normalized === "NORMAL"
  ) {
    return "NINGUNO"
  }

  if (
    normalized === "HOSPITALIZACION" ||
    normalized === "HOSPITALIZACION INMEDIATA" ||
    normalized === "HOSPITALIZAR" ||
    normalized === "CRITICO" ||
    normalized === "CRITICA" ||
    normalized === "SEVERO" ||
    normalized === "SEVERA" ||
    normalized === "EMERGENCIA"
  ) {
    return "HOSPITALIZACION"
  }

  if (normalized === "ALTO" || normalized === "HIGH") {
    return "ALTO"
  }

  if (
    normalized === "MEDIO" ||
    normalized === "MODERADO" ||
    normalized === "MODERADA" ||
    normalized === "BAJO" ||
    normalized === "LOW"
  ) {
    return "MEDIO"
  }

  return "NINGUNO"
}
