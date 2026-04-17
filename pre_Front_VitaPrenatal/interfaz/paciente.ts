export const BLOOD_TYPE_CATALOG = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const

export type TipoSangrePermitido = (typeof BLOOD_TYPE_CATALOG)[number]

export interface PacienteCreateRequest {
    nombre: string;
    edad: number;
    domicilio: string;
    estado_civil: string;
    ciudad: string;
    telefono: string;
    tipo_sangre: TipoSangrePermitido | null;
    abortos_previos: number;
    cesarea_previos: number;
    embarazos_previos: number;
    partos_previos: number;
    hipertension_previa: boolean;
    diabetes: boolean;
    antecedentes_familia_hipertension: boolean;
    fam_cardiopatia: boolean;
    enf_renal_cronica: boolean;
    embarazo_multiple: boolean;
    muerte_fetal: boolean;
    restriccion_fetal: boolean;
}

// Alias de compatibilidad para componentes legacy.
export type Paciente = PacienteCreateRequest

// Interfaz para cuando el servidor responde (ya con ID)
export interface PacienteResponse extends PacienteCreateRequest {
    id: number;
}

// Modelo de entrada del formulario frontend (camelCase)
export interface PacienteCreateFormInput {
    name: string;
    age: number;
    address: string;
    maritalStatus: string;
    city: string;
    phone: string;
    tipo_sangre: string | null;
    abortos_previos: number;
    cesarea_previos: number;
    embarazos_previos: number;
    partos_previos: number;
    previousHypertension: boolean;
    diabetes: boolean;
    familyHypertensionHistory: boolean;
    fam_cardiopatia: boolean;
    enf_renal_cronica: boolean;
    embarazo_multiple: boolean;
    muerte_fetal: boolean;
    restriccion_fetal: boolean;
}