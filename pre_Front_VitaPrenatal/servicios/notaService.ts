import { CrearNotaPayload, NotaClinica } from '../interfaz/nota';
import { fetchApi } from './apiClient';

type NotaApi = Record<string, unknown>;

function asPositiveInteger(value: unknown): number | null {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return Math.trunc(parsed);
}

function asDateString(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
        return new Date().toISOString();
    }

    return value;
}

function normalizeNota(raw: NotaApi): NotaClinica {
    const id = asPositiveInteger(raw.id ?? raw.nota_id);
    const consultaId = asPositiveInteger(raw.consulta_id ?? raw.consultaId);
    const pacienteId = asPositiveInteger(raw.paciente_id ?? raw.pacienteId);
    const contenido = typeof raw.contenido === 'string' ? raw.contenido.trim() : '';

    if (id === null || consultaId === null || pacienteId === null || !contenido) {
        throw new Error('Formato de nota clinica invalido.');
    }

    return {
        id,
        consulta_id: consultaId,
        paciente_id: pacienteId,
        contenido,
        fecha_creacion: asDateString(raw.fecha_creacion ?? raw.created_at ?? raw.fecha),
    };
}

export const notaService = {
    crear: async (payload: CrearNotaPayload): Promise<NotaClinica> => {
        const response = await fetchApi('/api/notas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Error al crear nota: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
        }

        const data = await response.json();
        return normalizeNota(data as NotaApi);
    },

    listarPorConsulta: async (consultaId: number): Promise<NotaClinica[]> => {
        const response = await fetchApi(`/api/notas/consulta/${consultaId}`);

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Error al obtener notas: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            return [];
        }

        return data
            .filter((item): item is NotaApi => item !== null && typeof item === 'object')
            .map((item) => normalizeNota(item));
    },

    actualizar: async (notaId: number, contenido: string): Promise<NotaClinica> => {
        const response = await fetchApi(`/api/notas/${notaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contenido }),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Error al actualizar nota: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
        }

        const data = await response.json();
        return normalizeNota(data as NotaApi);
    },

    eliminar: async (notaId: number): Promise<void> => {
        const response = await fetchApi(`/api/notas/${notaId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Error al eliminar nota: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
        }
    },
};
