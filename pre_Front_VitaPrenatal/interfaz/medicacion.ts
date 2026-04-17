export type RiesgoCanonicoMedicacion =
  | "NINGUNO"
  | "MEDIO"
  | "ALTO"
  | "HOSPITALIZACION"

export interface Medicamento {
  nombre?: string
  dosis?: string
  max?: string
  frecuencia?: string
  inicio?: string
  horario?: string
  suspension?: string
  alerta?: string
}

export interface GrupoMedicacion {
  grupo: string
  medicamentos: Medicamento[]
}

export interface MedicacionResponse {
  estado: "No indicada" | "Control" | "Indicada" | "Emergencia"
  detalle: GrupoMedicacion[]
  message?: string
}

export interface MedicacionPdfSnapshot {
  riesgo: RiesgoCanonicoMedicacion
  generatedAtIso: string
  response: MedicacionResponse
}
