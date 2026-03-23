import { ExpedienteClinico, ExpedienteResponse } from '../interfaz/expediente';

const API_URL = "http://localhost:8000"; // Tu URL de FastAPI

export const expedienteService = {
    // Crear un nuevo expediente
    crear: async (datos: ExpedienteClinico): Promise<ExpedienteResponse> => {
        const response = await fetch(`${API_URL}/expedientes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (!response.ok) throw new Error('Error al crear expediente');
        return await response.json();
    },

    // Obtener un expediente por ID de paciente
    obtenerPorId: async (id: number): Promise<ExpedienteResponse> => {
        const response = await fetch(`${API_URL}/expedientes/${id}`);
        if (!response.ok) throw new Error('Expediente no encontrado');
        return await response.json();
    }
};