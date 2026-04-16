import {
  PrediccionDatosConsulta,
  PrediccionResponse,
  RiesgoType,
} from "@/interfaz/consulta"
import { normalizeClinicalRisk } from "@/lib/risk-normalization"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()

    if (normalized === "true") {
      return true
    }

    if (normalized === "false") {
      return false
    }
  }

  return undefined
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const normalized = value.trim()
  return normalized ? normalized : undefined
}

function toRisk(value: unknown, fallback: RiesgoType = "NINGUNO"): RiesgoType {
  const normalized = toOptionalString(value)
  if (!normalized) {
    return fallback
  }

  return normalizeClinicalRisk(normalized)
}

function mapDatosConsulta(value: unknown): PrediccionDatosConsulta | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const edad_madre = toOptionalNumber(value.edad_madre)
  const imc = toOptionalNumber(value.imc)
  const presion_sistolica = toOptionalNumber(value.presion_sistolica)
  const presion_diastolica = toOptionalNumber(value.presion_diastolica)
  const hipertension_previa = toOptionalBoolean(value.hipertension_previa)
  const diabetes = toOptionalBoolean(value.diabetes)
  const antecedentes_familia_hipertension = toOptionalBoolean(value.antecedentes_familia_hipertension)

  if (
    edad_madre === undefined ||
    imc === undefined ||
    presion_sistolica === undefined ||
    presion_diastolica === undefined ||
    hipertension_previa === undefined ||
    diabetes === undefined ||
    antecedentes_familia_hipertension === undefined
  ) {
    return undefined
  }

  return {
    edad_madre,
    imc,
    presion_sistolica,
    presion_diastolica,
    hipertension_previa,
    diabetes,
    antecedentes_familia_hipertension,
  }
}

export function mapPredictionResponse(raw: unknown, fallbackConsultaId?: number): PrediccionResponse {
  const payload = isRecord(raw) ? raw : {}

  const consultaId = toOptionalNumber(payload.consulta_id)
  const riesgo = toRisk(payload.riesgo, "NINGUNO")

  return {
    consulta_id: consultaId ?? fallbackConsultaId ?? 0,
    paciente_id: toOptionalNumber(payload.paciente_id),
    riesgo,
    riesgo_ml: toRisk(payload.riesgo_ml, riesgo),
    riesgo_ml_modelo: toOptionalString(payload.riesgo_ml_modelo) ?? null,
    score_total: toOptionalNumber(payload.score_total),
    confianza_ml: toOptionalNumber(payload.confianza_ml),
    interpretacion: toOptionalString(payload.interpretacion) ?? "",
    datos_consulta: mapDatosConsulta(payload.datos_consulta),
  }
}
