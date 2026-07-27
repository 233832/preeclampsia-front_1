import { ExpedienteClinico, ExpedienteResponse } from '../interfaz/expediente';
import { fetchApi } from './apiClient';
import { assertApiResponse } from './apiError';
import { fetchAllPaginated } from './pagination';

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
    listar: async (): Promise<ExpedienteResponse[]> => {
        return await fetchAllPaginated<ExpedienteResponse>(
            (skip, limit) => `/api/expedientes/?skip=${skip}&limit=${limit}`,
            'obtener expedientes',
        );
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