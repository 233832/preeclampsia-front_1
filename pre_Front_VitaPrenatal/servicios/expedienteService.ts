import { ExpedienteClinico, ExpedienteResponse } from '../interfaz/expediente';
import { fetchApi } from './apiClient';
import { assertApiResponse } from './apiError';

export const expedienteService = {
    // Crear un nuevo expediente
    crear: async (datos: ExpedienteClinico): Promise<ExpedienteResponse> => {
        const response = await fetchApi('/api/expedientes/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        await assertApiResponse(response, 'crear expediente');
        return await response.json();
    },

    // Obtener lista de expedientes
    listar: async (skip: number = 0, limit: number = 100): Promise<ExpedienteResponse[]> => {
        const response = await fetchApi(`/api/expedientes/?skip=${skip}&limit=${limit}`);
        await assertApiResponse(response, 'obtener expedientes');
        return await response.json();
    },

    // Obtener un expediente por ID
    obtenerPorId: async (id: number): Promise<ExpedienteResponse> => {
        const response = await fetchApi(`/api/expedientes/${id}`);
        await assertApiResponse(response, 'obtener expediente por ID');
        return await response.json();
    },

    // Eliminar un expediente
    eliminar: async (id: number): Promise<void> => {
        const response = await fetchApi(`/api/expedientes/${id}`, {
            method: 'DELETE',
        });
        await assertApiResponse(response, 'eliminar expediente');
    }
};