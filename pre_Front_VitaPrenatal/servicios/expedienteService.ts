import { ExpedienteClinico, ExpedienteResponse } from '../interfaz/expediente';

const API_URL = "http://127.0.0.1:8000"; // Tu URL de FastAPI

export const expedienteService = {
    // Crear un nuevo expediente
    crear: async (datos: ExpedienteClinico): Promise<ExpedienteResponse> => {
        const response = await fetch(`${API_URL}/api/expedientes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (!response.ok) throw new Error('Error al crear expediente');
        return await response.json();
    },

    // Obtener lista de expedientes
    listar: async (skip: number = 0, limit: number = 100): Promise<ExpedienteResponse[]> => {
        const response = await fetch(`${API_URL}/api/expedientes/?skip=${skip}&limit=${limit}`);
        if (!response.ok) throw new Error('Error al obtener expedientes');
        return await response.json();
    },

    // Obtener un expediente por ID
    obtenerPorId: async (id: number): Promise<ExpedienteResponse> => {
        const response = await fetch(`${API_URL}/api/expedientes/${id}`);
        if (!response.ok) throw new Error('Expediente no encontrado');
        return await response.json();
    },

    // Eliminar un expediente
    eliminar: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/api/expedientes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar expediente');
    }
};