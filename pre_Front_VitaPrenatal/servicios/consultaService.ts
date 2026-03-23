import { Consulta, PrediccionResponse } from '../interfaz/consulta';

const API_URL = "http://localhost:8000"; // Asegúrate que coincida con tu puerto de FastAPI

export const consultaService = {
    // 1. Enviar los datos de la consulta al backend
    crear: async (datos: Consulta): Promise<any> => {
        const response = await fetch(`${API_URL}/consultas/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (!response.ok) throw new Error('Error al guardar consulta');
        return await response.json();
    },

    // 2. Pedirle a Gemini que analice esa consulta específica
    obtenerPrediccion: async (id: number): Promise<PrediccionResponse> => {
        const response = await fetch(`${API_URL}/consultas/${id}/prediccion`);
        if (!response.ok) throw new Error('Error al obtener predicción');
        return await response.json();
    }
};