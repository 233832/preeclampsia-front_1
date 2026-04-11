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

function unique(values: Array<string | null>): string[] {
  const result: string[] = []

  for (const value of values) {
    if (!value || result.includes(value)) {
      continue
    }

    result.push(value)
  }

  return result
}

const apiOrigins = unique([
  normalizeApiOrigin(process.env.NEXT_PUBLIC_API_ORIGIN),
  normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL),
  "http://localhost:8000",
  "http://127.0.0.1:8000",
])

export function buildApiUrl(path: string, origin = apiOrigins[0]): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${origin}${normalizedPath}`
}

export async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  let lastNetworkError: unknown = null

  for (const origin of apiOrigins) {
    const url = buildApiUrl(path, origin)

    try {
      return await fetch(url, init)
    } catch (error) {
      lastNetworkError = error

      if (!(error instanceof TypeError)) {
        throw error
      }

      console.warn(`⚠️ No se pudo conectar con ${url}`)
    }
  }

  throw new Error(
    `No se pudo conectar al backend. Hosts intentados: ${apiOrigins.join(", ")}`,
  )
}
