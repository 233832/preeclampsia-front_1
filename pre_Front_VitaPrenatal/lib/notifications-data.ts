import { ConfiguracionesClinicas, NotificacionClinica } from "@/interfaz/configuracion"

export const notificationSeedData: NotificacionClinica[] = [
  {
    id: 1,
    tipo: "critica",
    mensaje: "Nivel de riesgo alto detectado",
    paciente: "Ana Martínez",
    fecha: "18/04/2024",
    leida: false,
  },
  {
    id: 2,
    tipo: "advertencia",
    mensaje: "Presión arterial ≥140/90 detectada",
    paciente: "Ana Martínez",
    fecha: "18/04/2024",
    leida: false,
  },
  {
    id: 3,
    tipo: "informativa",
    mensaje: "Seguimiento pendiente",
    paciente: "Laura Sánchez",
    fecha: "19/04/2024",
    leida: true,
  },
]

export function isNotificationEnabled(
  notification: NotificacionClinica,
  configuraciones: ConfiguracionesClinicas,
): boolean {
  if (!configuraciones.notificacionesActivas) {
    return false
  }

  if (notification.tipo === "critica") {
    return configuraciones.criticas
  }

  if (notification.tipo === "advertencia") {
    return configuraciones.advertencias
  }

  return configuraciones.informativas
}