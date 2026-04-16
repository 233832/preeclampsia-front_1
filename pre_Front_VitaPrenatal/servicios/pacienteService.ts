import { PacienteCreateRequest, PacienteResponse } from '../interfaz/paciente';
import { fetchApi } from './apiClient';
import { assertApiResponse } from './apiError';

export async function createPatient(datos: PacienteCreateRequest): Promise<PacienteResponse> {
    const response = await fetchApi('/api/pacientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
    });

    await assertApiResponse(response, 'registrar paciente');
    return await response.json();
}

export async function updatePatient(id: number, datos: PacienteCreateRequest): Promise<PacienteResponse> {
    const response = await fetchApi(`/api/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
    });

    await assertApiResponse(response, 'actualizar paciente');
    return await response.json();
}

export const pacienteService = {
    // Registrar nueva paciente
    crear: createPatient,

    // Actualizar paciente por ID
    actualizar: updatePatient,

    // Obtener datos de una paciente específica
    obtenerPorId: async (id: number): Promise<PacienteResponse> => {
        const response = await fetchApi(`/api/pacientes/${id}`);
        await assertApiResponse(response, 'obtener paciente por ID');
        return await response.json();
    }
};