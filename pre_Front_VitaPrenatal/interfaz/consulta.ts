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
    riesgo?: RiesgoType;
    riesgo_ml?: RiesgoType | null;
    riesgo_ml_modelo?: string | null;
    confianza_ml?: number | null;
    score_total?: number | null;
    interpretacion?: string | null;
}

export interface PrediccionResponse {
    consulta_id: number;
    paciente_id?: number;
    riesgo: RiesgoType;
    riesgo_ml: RiesgoType;
    riesgo_ml_modelo?: string | null;
    confianza_ml?: number | null;
    score_total?: number | null;
    interpretacion: string;
    datos_consulta?: PrediccionDatosConsulta;
}