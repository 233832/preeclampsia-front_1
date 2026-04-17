import { Consulta, PrediccionResponse } from '../interfaz/consulta';
import { buildApiUrl, fetchApi } from './apiClient';
import { assertApiResponse } from './apiError';
import { mapPredictionResponse } from './prediccionMapper';

export const consultaService = {
    // Crear una nueva consulta
    crear: async (datos: Consulta): Promise<Consulta> => {
        const response = await fetchApi('/api/consultas/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        await assertApiResponse(response, 'guardar consulta');
        return await response.json();
    },

    // Obtener lista de consultas
    listar: async (skip: number = 0, limit: number = 100): Promise<Consulta[]> => {
        const response = await fetchApi(`/api/consultas/?skip=${skip}&limit=${limit}`);
        await assertApiResponse(response, 'obtener consultas');
        return await response.json();
    },

    listarPorPacienteId: async (pacienteId: number, skip: number = 0, limit: number = 100): Promise<Consulta[]> => {
        const response = await fetchApi(`/api/consultas/?paciente_id=${pacienteId}&skip=${skip}&limit=${limit}`);
        await assertApiResponse(response, 'obtener consultas por paciente');
        return await response.json();
    },

    // Obtener detalles de una consulta por ID
    obtenerPorId: async (id: number): Promise<Consulta> => {
        const response = await fetchApi(`/api/consultas/${id}`);
        await assertApiResponse(response, 'obtener consulta por ID');
        return await response.json();
    },


    // Obtener predicción de una consulta
    obtenerPrediccion: async (id: number): Promise<PrediccionResponse> => {
        const response = await fetchApi(`/api/consultas/${id}/prediccion`);
        await assertApiResponse(response, 'obtener prediccion de consulta');
        const payload = await response.json();
        return mapPredictionResponse(payload, id);
    },

    obtenerUrlReportePdf: (idConsulta: number): string => {
        if (!Number.isFinite(idConsulta) || idConsulta <= 0) {
            throw new Error('ID de consulta invalido para generar URL del reporte.');
        }

        return buildApiUrl(`/api/reportes/${idConsulta}`);
    },

    // Descargar reporte PDF de una consulta
    descargarReportePdf: async (idConsulta: number): Promise<void> => {
        if (!Number.isFinite(idConsulta) || idConsulta <= 0) {
            throw new Error("ID de consulta inválido para descargar reporte.");
        }

        const response = await fetchApi(`/api/reportes/${idConsulta}`, {
            method: 'GET',
            headers: {
                Accept: 'application/pdf',
            },
        });
        await assertApiResponse(response, 'descargar reporte PDF');

        const pdfBlob = await response.blob();

        if (pdfBlob.size === 0) {
            throw new Error('El reporte PDF llegó vacío.');
        }

        if (typeof window === 'undefined') {
            throw new Error('La descarga de PDF solo está disponible en el navegador.');
        }

        const objectUrl = window.URL.createObjectURL(pdfBlob);

        try {
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `reporte_${idConsulta}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } finally {
            window.URL.revokeObjectURL(objectUrl);
        }
    }
};