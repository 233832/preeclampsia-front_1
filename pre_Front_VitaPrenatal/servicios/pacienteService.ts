import { Paciente, PacienteResponse } from '../interfaz/paciente';
import { fetchApi } from './apiClient';

export const pacienteService = {
    // Registrar nueva paciente
    crear: async (datos: Paciente): Promise<PacienteResponse> => {
        const response = await fetchApi('/api/pacientes/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (!response.ok) throw new Error(`Error al registrar paciente: ${response.status} ${response.statusText} (${response.url})`);
        return await response.json();
    },

    // Obtener datos de una paciente específica
    obtenerPorId: async (id: number): Promise<PacienteResponse> => {
        const response = await fetchApi(`/api/pacientes/${id}`);
        if (!response.ok) throw new Error(`Paciente no encontrada: ${response.status} ${response.statusText} (${response.url})`);
        return await response.json();
    }
};