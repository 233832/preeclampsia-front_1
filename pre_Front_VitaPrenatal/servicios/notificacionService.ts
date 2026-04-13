import { fetchApi } from './apiClient';
import { pacienteService } from './pacienteService';

type NotificacionApi = Record<string, unknown>;

function toPositiveInteger(value: unknown): number | null {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

function extractPacienteId(item: NotificacionApi): number | null {
    return toPositiveInteger(
        item.paciente_id ?? item.pacienteId ?? item.patient_id ?? item.patientId,
    );
}

export const notificacionService = {
    getNotificaciones: async (): Promise<NotificacionApi[]> => {
        return await getNotificacionesDesde('/api/notificaciones');
    },

    getNotificacionesNoLeidas: async (): Promise<NotificacionApi[]> => {
        return await getNotificacionesDesde('/api/notificaciones/no-leidas');
    },

    marcarComoLeida: async (id: number): Promise<void> => {
        const response = await fetchApi(`/api/notificaciones/${id}/leida`, {
            method: 'PUT',
        });

        if (!response.ok) {
            throw new Error('Error al marcar notificación como leída');
        }
    },
};

async function getNotificacionesDesde(path: string): Promise<NotificacionApi[]> {
    const response = await fetchApi(path);

    if (!response.ok) {
        throw new Error('Error al obtener notificaciones');
    }

    const payload = await response.json();

    if (!Array.isArray(payload)) {
        return [];
    }

    const notificaciones = payload
        .filter((item) => item !== null && typeof item === 'object')
        .map((item) => ({ ...(item as NotificacionApi) }));

    const pacienteIds = Array.from(
        new Set(
            notificaciones
                .map((item) => extractPacienteId(item))
                .filter((id): id is number => id !== null),
        ),
    );

    const nombresPorPacienteId = new Map<number, string>();

    await Promise.all(
        pacienteIds.map(async (pacienteId) => {
            try {
                const paciente = await pacienteService.obtenerPorId(pacienteId);

                if (paciente.nombre?.trim()) {
                    nombresPorPacienteId.set(pacienteId, paciente.nombre.trim());
                }
            } catch (error) {
                console.warn(`No se pudo resolver nombre para paciente ${pacienteId}`, error);
            }
        }),
    );

    return notificaciones.map((item) => {
        const existingName =
            typeof item.paciente === 'string' && item.paciente.trim()
                ? item.paciente.trim()
                : null;

        if (existingName) {
            return item;
        }

        const pacienteId = extractPacienteId(item);

        if (pacienteId === null) {
            return item;
        }

        return {
            ...item,
            paciente: nombresPorPacienteId.get(pacienteId) ?? `Paciente #${pacienteId}`,
        };
    });
}