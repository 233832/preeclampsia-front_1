export interface CrearNotaPayload {
    consulta_id: number;
    paciente_id: number;
    contenido: string;
}

export interface NotaClinica {
    id: number;
    consulta_id: number;
    paciente_id: number;
    contenido: string;
    fecha_creacion: string;
}
