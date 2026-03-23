export interface ExpedienteClinico {
    id?: number; // El ID es opcional al crear, pero el server lo devuelve
    paciente_id: number;
}

export interface ExpedienteResponse extends ExpedienteClinico {
    id: number;
}