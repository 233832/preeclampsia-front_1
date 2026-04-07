import { Consulta, PrediccionResponse } from '../interfaz/consulta';

const API_URL = "http://127.0.0.1:8000"; // Asegúrate que coincida con tu puerto de FastAPI

export const consultaService = {
    // Crear una nueva consulta
    crear: async (datos: Consulta): Promise<any> => {
        const response = await fetch(`${API_URL}/api/consultas/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (!response.ok) throw new Error('Error al guardar consulta');
        return await response.json();
    },

    // Obtener lista de consultas
    listar: async (skip: number = 0, limit: number = 100): Promise<Consulta[]> => {
        const response = await fetch(`${API_URL}/api/consultas/?skip=${skip}&limit=${limit}`);
        if (!response.ok) throw new Error('Error al obtener consultas');
        const data = await response.json();
        console.log("🌐 RESPUESTA BRUTA DEL API /api/consultas/:", data);
        return data;
    },

    // Obtener predicción de una consulta
    obtenerPrediccion: async (id: number): Promise<PrediccionResponse> => {
        const url = `${API_URL}/api/consultas/${id}/prediccion`;
        console.log(`🧪 consultaService.obtenerPrediccion -> solicitando ${url}`);

        const response = await fetch(url);

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