export interface Consulta {
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
}

export interface PrediccionResponse {
    consulta_id: number;
    riesgo: string;
    interpretacion: string;
    datos_consulta: any;
}