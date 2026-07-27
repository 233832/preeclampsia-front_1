export type RiesgoType = "NINGUNO" | "MEDIO" | "ALTO" | "HOSPITALIZACION"

export interface PrediccionDatosConsulta {
    edad_madre: number;
    imc: number;
    presion_sistolica: number;
    presion_diastolica: number;
    hipertension_previa: boolean;
    diabetes: boolean;
    antecedentes_familia_hipertension: boolean;
}

export interface Consulta {
    id?: number;
    paciente_id: number;
    expediente_id: number;
    fecha_hora_consulta: string; // En el front se maneja como string ISO
    edad_madre: number;
    edad_gestacional: number;
    altura: number;
    peso: number;
    imc: number;
    presion_sistolica: number;
    presion_diastolica: number;
    pam: number;
    riesgo?: string;
    riesgo_ml?: string | null;
    riesgo_ml_modelo?: string | null;
    confianza_ml?: number | null;
    score_total?: number | null;
    interpretacion?: string | null;
    recomendacion_doctor?: string | null;
    incluir_medicacion_sugerida?: boolean;
    incluir_recomendacion_doctor?: boolean;
}

export interface ConsultaDetail extends Consulta {
    id: number;
    riesgo: string;
    score_total: number | null;
    riesgo_ml: string | null;
    riesgo_ml_modelo: string | null;
    confianza_ml: number | null;
    interpretacion: string | null;
    pam: number;
    recomendacion_doctor: string | null;
    incluir_medicacion_sugerida: boolean;
    incluir_recomendacion_doctor: boolean;
}

export interface ConsultaMedicacionUpdate {
    recomendacion_doctor?: string | null;
    incluir_medicacion_sugerida?: boolean | null;
    incluir_recomendacion_doctor?: boolean | null;
}

export interface PrediccionInterpretacionResponse {
    consulta_id: number;
    paciente_id: number | null;
    interpretacion: string;
}