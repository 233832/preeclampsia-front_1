import { buildApiUrl, shouldIncludeCredentials } from "@/lib/api-base-url"
import { getAuthToken, notifyUnauthorized } from "@/lib/auth-token-store"

export { buildApiUrl }

export async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  const url = buildApiUrl(path)
  const token = getAuthToken()
  const includeCredentials = shouldIncludeCredentials()
  const headers = new Headers(init?.headers)

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    const response = await fetch(url, {
      ...init,
      credentials: init?.credentials ?? (includeCredentials ? "include" : "omit"),
      headers,
    })

    if (response.status === 401) {
      notifyUnauthorized()
    }

    return response
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`No se pudo conectar al backend en ${url}`)
    }

    throw error
  }
}
