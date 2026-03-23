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
        return await response.json();
    },

    // Obtener predicción de una consulta
    obtenerPrediccion: async (id: number): Promise<PrediccionResponse> => {
        const response = await fetch(`${API_URL}/api/consultas/${id}/prediccion`);
        if (!response.ok) throw new Error('Error al obtener predicción');
        return await response.json();
    }
};