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

const apiOrigin =
  normalizeApiOrigin(process.env.NEXT_PUBLIC_API_ORIGIN) ??
  normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL) ??
  "http://localhost:8000"

export function buildApiUrl(path: string, origin = apiOrigin): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${origin}${normalizedPath}`
}

export async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  const url = buildApiUrl(path)

  try {
    return await fetch(url, init)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`No se pudo conectar al backend en ${url}`)
    }

    throw error
  }
}
