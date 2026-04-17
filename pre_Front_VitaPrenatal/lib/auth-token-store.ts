let authToken: string | null = null

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

export function getAuthToken(): string | null {
  return authToken
}

export function setAuthToken(token: string | null): void {
  authToken = token && token.trim() ? token.trim() : null
}

export function registerUnauthorizedHandler(handler: UnauthorizedHandler | null): () => void {
  unauthorizedHandler = handler

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null
    }
  }
}

export function notifyUnauthorized(): void {
  if (!unauthorizedHandler) {
    return
  }

  unauthorizedHandler()
}
