import { Consulta, PrediccionResponse } from '../interfaz/consulta';
import { buildApiUrl, fetchApi } from './apiClient';

export const consultaService = {
    // Crear una nueva consulta
    crear: async (datos: Consulta): Promise<any> => {
        const response = await fetchApi('/api/consultas/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (!response.ok) throw new Error(`Error al guardar consulta: ${response.status} ${response.statusText} (${response.url})`);
        return await response.json();
    },

    // Obtener lista de consultas
    listar: async (skip: number = 0, limit: number = 100): Promise<Consulta[]> => {
        const response = await fetchApi(`/api/consultas/?skip=${skip}&limit=${limit}`);
        if (!response.ok) throw new Error(`Error al obtener consultas: ${response.status} ${response.statusText} (${response.url})`);
        const data = await response.json();
        console.log("🌐 RESPUESTA BRUTA DEL API /api/consultas/:", data);
        return data;
    },

    // Obtener detalles de una consulta por ID
    obtenerPorId: async (id: number): Promise<Consulta> => {
        const response = await fetchApi(`/api/consultas/${id}`);
        if (!response.ok) throw new Error(`Error al obtener consulta por ID: ${response.status} ${response.statusText} (${response.url})`);
        return await response.json();
    },


    // Obtener predicción de una consulta
    obtenerPrediccion: async (id: number): Promise<PrediccionResponse> => {
        const url = buildApiUrl(`/api/consultas/${id}/prediccion`);
        console.log(`🧪 consultaService.obtenerPrediccion -> solicitando ${url}`);

        const response = await fetchApi(`/api/consultas/${id}/prediccion`);

        if (!response.ok) {
            const bodyText = await response.text();
            console.error(`⚠️ consultaService.obtenerPrediccion error ${response.status} ${response.statusText}`);
            console.error(`⚠️ Body:`, bodyText);
            throw new Error(`Error al obtener predicción: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ consultaService.obtenerPrediccion respuesta JSON:", data);
        return data;
    }
};