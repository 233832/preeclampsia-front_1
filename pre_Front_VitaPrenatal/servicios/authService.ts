import axios from "axios"
import type { AuthCredentials, LoginResponse, RegisterResponse } from "@/interfaz/auth"
import { resolveApiOrigin, shouldIncludeCredentials } from "@/lib/api-base-url"
import { axiosClient } from "@/servicios/axiosClient"

export class AuthServiceError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "AuthServiceError"
    this.status = status
  }
}

type AuthAction = "register" | "login"

function getFriendlyAuthError(error: unknown, action: AuthAction): AuthServiceError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status

    if (!status) {
      return new AuthServiceError("No se pudo conectar al servidor")
    }

    if (status === 400) {
      if (action === "register") {
        return new AuthServiceError("El usuario ya existe", status)
      }

      return new AuthServiceError("Datos invalidos", status)
    }

    if (status === 401) {
      return new AuthServiceError("Sesion expirada o no autenticada", status)
    }

    if (status === 404) {
      if (action === "login") {
        return new AuthServiceError("Usuario no encontrado", status)
      }

      return new AuthServiceError("Recurso no encontrado", status)
    }

    if (status === 422) {
      return new AuthServiceError("Datos invalidos", status)
    }

    return new AuthServiceError(`Error de autenticacion (${status})`, status)
  }

  if (error instanceof Error) {
    return new AuthServiceError(error.message)
  }

  return new AuthServiceError("Error inesperado de autenticacion")
}

async function register(credentials: AuthCredentials): Promise<RegisterResponse> {
  try {
    const response = await axiosClient.post<RegisterResponse>("/api/auth/register", credentials)
    return response.data
  } catch (error) {
    throw getFriendlyAuthError(error, "register")
  }
}

async function login(credentials: AuthCredentials): Promise<LoginResponse> {
  try {
    const response = await axiosClient.post<LoginResponse>("/api/auth/login", credentials)
    return response.data
  } catch (error) {
    throw getFriendlyAuthError(error, "login")
  }
}

async function validateSession(): Promise<boolean> {
  if (!shouldIncludeCredentials()) {
    return false
  }

  const baseURL = resolveApiOrigin()

  try {
    await axios.get(`${baseURL}/api/medicacion/hospitalizacion`, {
      withCredentials: true,
      timeout: 8000,
    })
    return true
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return false
    }

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Fallback endpoint if medicacion routes are unavailable.
      try {
        await axios.get(`${baseURL}/api/pacientes/?skip=0&limit=1`, {
          withCredentials: true,
          timeout: 8000,
        })
        return true
      } catch {
        return false
      }
    }

    return false
  }
}

async function logout(): Promise<void> {
  try {
    await axiosClient.post("/api/auth/logout")
  } catch {
    // Backend logout endpoint is optional; frontend clears auth state anyway.
  }
}

export const authService = {
  register,
  login,
  validateSession,
  logout,
}
