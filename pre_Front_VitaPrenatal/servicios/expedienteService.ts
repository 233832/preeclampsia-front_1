import { ExpedienteClinico, ExpedienteResponse } from '../interfaz/expediente';
import { fetchApi } from './apiClient';

export const expedienteService = {
    // Crear un nuevo expediente
    crear: async (datos: ExpedienteClinico): Promise<ExpedienteResponse> => {
        const response = await fetchApi('/api/expedientes/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (!response.ok) throw new Error(`Error al crear expediente: ${response.status} ${response.statusText} (${response.url})`);
        return await response.json();
    },

    // Obtener lista de expedientes
    listar: async (skip: number = 0, limit: number = 100): Promise<ExpedienteResponse[]> => {
        const response = await fetchApi(`/api/expedientes/?skip=${skip}&limit=${limit}`);
        if (!response.ok) throw new Error(`Error al obtener expedientes: ${response.status} ${response.statusText} (${response.url})`);
        return await response.json();
    },

    // Obtener un expediente por ID
    obtenerPorId: async (id: number): Promise<ExpedienteResponse> => {
        const response = await fetchApi(`/api/expedientes/${id}`);
        if (!response.ok) throw new Error(`Expediente no encontrado: ${response.status} ${response.statusText} (${response.url})`);
        return await response.json();
    },

    // Eliminar un expediente
    eliminar: async (id: number): Promise<void> => {
        const response = await fetchApi(`/api/expedientes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Error al eliminar expediente: ${response.status} ${response.statusText} (${response.url})`);
    }
};