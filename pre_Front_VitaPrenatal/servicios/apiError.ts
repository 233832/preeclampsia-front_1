export class ApiServiceError extends Error {
  status: number
  url: string
  details?: unknown

  constructor(message: string, status: number, url: string, details?: unknown) {
    super(message)
    this.name = "ApiServiceError"
    this.status = status
    this.url = url
    this.details = details
  }
}

type ValidationIssue = {
  loc?: Array<string | number>
  msg?: string
  type?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parseValidationIssues(details: unknown): ValidationIssue[] {
  if (Array.isArray(details)) {
    return details.filter(isRecord).map((issue) => ({
      loc: Array.isArray(issue.loc) ? (issue.loc as Array<string | number>) : undefined,
      msg: typeof issue.msg === "string" ? issue.msg : undefined,
      type: typeof issue.type === "string" ? issue.type : undefined,
    }))
  }

  if (isRecord(details) && Array.isArray(details.detail)) {
    return parseValidationIssues(details.detail)
  }

  return []
}

export function getApiValidationFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiServiceError)) {
    return {}
  }

  const issues = parseValidationIssues(error.details)
  const fieldErrors: Record<string, string> = {}

  for (const issue of issues) {
    const maybeField = issue.loc?.[issue.loc.length - 1]

    if (typeof maybeField !== "string" || !maybeField) {
      continue
    }

    if (fieldErrors[maybeField]) {
      continue
    }

    fieldErrors[maybeField] = issue.msg ?? "Valor invalido"
  }

  return fieldErrors
}

function formatValidationMessage(details: unknown): string {
  const issues = parseValidationIssues(details)

  if (issues.length === 0) {
    if (typeof details === "string" && details.trim()) {
      return details.trim()
    }

    if (isRecord(details) && typeof details.detail === "string" && details.detail.trim()) {
      return details.detail.trim()
    }

    return "Revise los campos del formulario."
  }

  return issues
    .map((issue) => {
      const field = issue.loc?.length ? String(issue.loc[issue.loc.length - 1]) : "campo"
      const message = issue.msg ?? "valor invalido"
      return `${field}: ${message}`
    })
    .join(" | ")
}

async function readErrorDetails(response: Response): Promise<unknown> {
  try {
    return await response.clone().json()
  } catch {
    try {
      const text = await response.clone().text()
      return text || undefined
    } catch {
      return undefined
    }
  }
}

export async function assertApiResponse(response: Response, actionLabel: string): Promise<void> {
  if (response.ok) {
    return
  }

  const details = await readErrorDetails(response)

  if (response.status === 404) {
    throw new ApiServiceError("Recurso no encontrado", response.status, response.url, details)
  }

  if (response.status === 422) {
    const validationMessage = formatValidationMessage(details)
    throw new ApiServiceError(`Validaciones del formulario: ${validationMessage}`, response.status, response.url, details)
  }

  if (response.status >= 500) {
    throw new ApiServiceError("Error del servidor", response.status, response.url, details)
  }

  const fallbackMessage = `Error al ${actionLabel}: ${response.status} ${response.statusText}`
  throw new ApiServiceError(fallbackMessage, response.status, response.url, details)
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiServiceError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Ocurrio un error inesperado"
}
