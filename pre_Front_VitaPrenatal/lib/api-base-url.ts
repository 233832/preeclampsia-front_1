const API_ORIGIN_ENV_KEYS = [
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_API_ORIGIN",
  "NEXT_PUBLIC_API_URL",
] as const

const CREDENTIALS_FLAG_ENV_KEY = "NEXT_PUBLIC_AUTH_WITH_CREDENTIALS"

function normalizeApiOrigin(value: string | undefined): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim().replace(/\/+$/, "")

  if (!trimmed) {
    return null
  }

  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed
}

export function resolveApiOrigin(): string {
  for (const envKey of API_ORIGIN_ENV_KEYS) {
    const fromEnv = normalizeApiOrigin(process.env[envKey])

    if (fromEnv) {
      return fromEnv
    }
  }

  return "http://127.0.0.1:8000"
}

export function buildApiUrl(path: string, origin = resolveApiOrigin()): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${origin}${normalizedPath}`
}

export function shouldIncludeCredentials(): boolean {
  const explicitFlag = process.env[CREDENTIALS_FLAG_ENV_KEY]?.trim().toLowerCase()

  if (explicitFlag === "true") {
    return true
  }

  if (explicitFlag === "false") {
    return false
  }

  if (typeof window === "undefined") {
    return false
  }

  try {
    const apiOrigin = new URL(resolveApiOrigin()).origin
    return apiOrigin === window.location.origin
  } catch {
    return false
  }
}
