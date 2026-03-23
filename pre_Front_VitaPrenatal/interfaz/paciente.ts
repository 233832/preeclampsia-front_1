export interface Paciente {
    id?: number; // Opcional porque al crear no lo tenemos
    nombre: string;
    edad: number;
    domicilio: string;
    estado_civil: string;
    ciudad: string;
    telefono: string;
    hipertension_previa: boolean;
    diabetes: boolean;
    antecedentes_familia_hipertension: boolean;
}

// Interfaz para cuando el servidor responde (ya con ID)
export interface PacienteResponse extends Paciente {
    id: number;
}