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
    riesgo?: string;
}

export interface PrediccionResponse {
    consulta_id: number;
    riesgo: string;
    riesgo_ml: string;
    confianza_ml: number;
    score_total: number;
    interpretacion: string;
    datos_consulta: any;
}