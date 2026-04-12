import { buildApiUrl, fetchApi } from './apiClient';

function parsePdfFileName(contentDisposition: string | null, consultaId: number): string {
    if (!contentDisposition) {
        return `reporte_${consultaId}.pdf`;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1]);
    }

    const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (plainMatch?.[1]) {
        return plainMatch[1];
    }

    return `reporte_${consultaId}.pdf`;
}

function assertConsultaId(consultaId: number): void {
    if (!Number.isFinite(consultaId) || consultaId <= 0) {
        throw new Error('ID de consulta invalido para reportes clinicos.');
    }
}

export const reporteService = {
    obtenerUrlVistaPrevia: (consultaId: number): string => {
        assertConsultaId(consultaId);
        return buildApiUrl(`/api/reportes/${consultaId}/preview`);
    },

    obtenerUrlPdf: (consultaId: number): string => {
        assertConsultaId(consultaId);
        return buildApiUrl(`/api/reportes/${consultaId}`);
    },

    abrirVistaPrevia: async (consultaId: number): Promise<void> => {
        assertConsultaId(consultaId);

        const response = await fetchApi(`/api/reportes/${consultaId}/preview`, {
            method: 'GET',
            headers: {
                Accept: 'text/html',
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `Error al obtener vista previa: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`,
            );
        }

        const html = await response.text();

        if (!html.trim()) {
            throw new Error('La vista previa del reporte no contiene contenido.');
        }

        if (typeof window === 'undefined') {
            throw new Error('La vista previa solo esta disponible en el navegador.');
        }

        const previewBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const objectUrl = window.URL.createObjectURL(previewBlob);

        const opened = window.open(objectUrl, '_blank', 'noopener,noreferrer');

        if (!opened) {
            window.URL.revokeObjectURL(objectUrl);
            throw new Error('El navegador bloqueo la apertura de la vista previa.');
        }

        window.setTimeout(() => {
            window.URL.revokeObjectURL(objectUrl);
        }, 60000);
    },

    descargarPdf: async (consultaId: number): Promise<void> => {
        assertConsultaId(consultaId);

        const response = await fetchApi(`/api/reportes/${consultaId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/pdf',
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `Error al descargar PDF: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`,
            );
        }

        const pdfBlob = await response.blob();

        if (pdfBlob.size === 0) {
            throw new Error('El reporte PDF se recibio vacio.');
        }

        if (typeof window === 'undefined') {
            throw new Error('La descarga PDF solo esta disponible en el navegador.');
        }

        const objectUrl = window.URL.createObjectURL(pdfBlob);
        const fileName = parsePdfFileName(response.headers.get('content-disposition'), consultaId);

        try {
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } finally {
            window.URL.revokeObjectURL(objectUrl);
        }
    },
};
