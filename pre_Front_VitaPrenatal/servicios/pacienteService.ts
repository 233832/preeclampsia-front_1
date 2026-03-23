import { Paciente, PacienteResponse } from '../interfaz/paciente';

const API_URL = "http://localhost:8000";

export const pacienteService = {
    // Registrar nueva paciente
    crear: async (datos: Paciente): Promise<PacienteResponse> => {
        const response = await fetch(`${API_URL}/pacientes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (!response.ok) throw new Error('Error al registrar paciente');
        return await response.json();
    },

    // Obtener datos de una paciente específica
    obtenerPorId: async (id: number): Promise<PacienteResponse> => {
        const response = await fetch(`${API_URL}/pacientes/${id}`);
        if (!response.ok) throw new Error('Paciente no encontrada');
        return await response.json();
    }
};