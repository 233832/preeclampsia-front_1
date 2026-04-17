import {
  BLOOD_TYPE_CATALOG,
  PacienteCreateFormInput,
  PacienteCreateRequest,
} from "@/interfaz/paciente"
import { ApiServiceError } from "@/servicios/apiError"

const BLOOD_TYPE_SET = new Set<string>(BLOOD_TYPE_CATALOG)

function normalizeText(value: string | undefined): string {
  const normalized = (value ?? "").trim()
  return normalized || "No especificado"
}

function normalizeCount(value: number | string | null | undefined): number {
  const normalized = Number(value)

  if (!Number.isFinite(normalized)) {
    return 0
  }

  return Math.max(0, Math.trunc(normalized))
}

function normalizeBloodType(value: string | null | undefined): PacienteCreateRequest["tipo_sangre"] {
  if (value === null || value === undefined) {
    return null
  }

  const normalized = value.trim().toUpperCase()

  if (!normalized) {
    return null
  }

  if (!BLOOD_TYPE_SET.has(normalized)) {
    throw new ApiServiceError(
      "Validaciones del formulario: tipo_sangre: Valor invalido. Use A+, A-, B+, B-, AB+, AB-, O+, O-",
      422,
      "/api/pacientes/",
      [
        {
          loc: ["body", "tipo_sangre"],
          msg: "Valor invalido. Use A+, A-, B+, B-, AB+, AB-, O+, O-",
          type: "value_error",
        },
      ],
    )
  }

  return normalized as PacienteCreateRequest["tipo_sangre"]
}

export function mapPatientFormToCreatePayload(
  formData: PacienteCreateFormInput,
): PacienteCreateRequest {
  return {
    nombre: formData.name.trim(),
    edad: Number(formData.age),
    domicilio: normalizeText(formData.address),
    estado_civil: normalizeText(formData.maritalStatus),
    ciudad: normalizeText(formData.city),
    telefono: normalizeText(formData.phone),
    tipo_sangre: normalizeBloodType(formData.tipo_sangre),
    abortos_previos: normalizeCount(formData.abortos_previos),
    cesarea_previos: normalizeCount(formData.cesarea_previos),
    embarazos_previos: normalizeCount(formData.embarazos_previos),
    partos_previos: normalizeCount(formData.partos_previos),
    hipertension_previa: Boolean(formData.previousHypertension),
    diabetes: Boolean(formData.diabetes),
    antecedentes_familia_hipertension: Boolean(formData.familyHypertensionHistory),
    fam_cardiopatia: Boolean(formData.fam_cardiopatia),
    enf_renal_cronica: Boolean(formData.enf_renal_cronica),
    embarazo_multiple: Boolean(formData.embarazo_multiple),
    muerte_fetal: Boolean(formData.muerte_fetal),
    restriccion_fetal: Boolean(formData.restriccion_fetal),
  }
}
