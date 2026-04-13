export type FrecuenciaSeguimientoDias = 7 | 14 | 30

export interface ConfiguracionesClinicas {
  umbralSistolico: number
  umbralDiastolico: number
  frecuenciaSeguimiento: FrecuenciaSeguimientoDias
  notificacionesActivas: boolean
  criticas: boolean
  advertencias: boolean
  informativas: boolean
}

export type TipoNotificacion = "critica" | "advertencia" | "informativa"

export interface NotificacionClinica {
  id: number
  tipo: TipoNotificacion
  mensaje: string
  paciente: string
  fecha: string
  leida: boolean
}