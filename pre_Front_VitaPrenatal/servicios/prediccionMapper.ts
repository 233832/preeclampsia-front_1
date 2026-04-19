import { PrediccionInterpretacionResponse } from "@/interfaz/consulta"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function toOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null
  }

  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toStringOrEmpty(value: unknown): string {
  if (typeof value !== "string") {
    return ""
  }

  return value.trim()
}

export function mapPredictionInterpretationResponse(
  raw: unknown,
  fallbackConsultaId?: number,
): PrediccionInterpretacionResponse {
  const payload = isRecord(raw) ? raw : {}

  const consultaId = toOptionalNumber(payload.consulta_id)

  return {
    consulta_id: consultaId ?? (fallbackConsultaId ?? 0),
    paciente_id: toOptionalNumber(payload.paciente_id),
    interpretacion: toStringOrEmpty(payload.interpretacion),
  }
}
