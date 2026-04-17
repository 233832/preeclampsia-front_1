import type { RiesgoCanonicoMedicacion } from "@/interfaz/medicacion"

function normalizeRiskText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
}

const RISK_MAP: Record<string, RiesgoCanonicoMedicacion> = {
  NINGUNO: "NINGUNO",
  MEDIO: "MEDIO",
  ALTO: "ALTO",
  HOSPITALIZACION: "HOSPITALIZACION",
  BAJO: "NINGUNO",
  MODERADO: "MEDIO",
  "HOSPITALIZACION URGENTE": "HOSPITALIZACION",
  "HOSPITALIZACION INMEDIATA": "HOSPITALIZACION",
  URGENTE: "HOSPITALIZACION",
}

export interface MedicacionRiskNormalizationResult {
  canonicalRisk: RiesgoCanonicoMedicacion | null
  normalizedInput: string
}

export function normalizeMedicacionRisk(input: string): MedicacionRiskNormalizationResult {
  const normalizedInput = normalizeRiskText(input)

  if (!normalizedInput) {
    return { canonicalRisk: null, normalizedInput }
  }

  return {
    canonicalRisk: RISK_MAP[normalizedInput] ?? null,
    normalizedInput,
  }
}

export function getMedicacionEndpointRiskSegment(risk: RiesgoCanonicoMedicacion): string {
  return risk.toLowerCase()
}

export function getMedicamentosAliasRiskSegment(risk: RiesgoCanonicoMedicacion): string {
  if (risk === "HOSPITALIZACION") {
    return "hospitalización"
  }

  return risk.toLowerCase()
}
