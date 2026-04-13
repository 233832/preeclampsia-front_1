export const MEXICO_TIME_ZONE = "America/Mexico_City"

const mexicoDatePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: MEXICO_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

type MexicoDateParts = {
  year: string
  month: string
  day: string
  hour: string
  minute: string
  second: string
}

function hasExplicitTimezone(value: string): boolean {
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)
}

function parseDateOnlyString(value: string): Date | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) {
    return null
  }

  const year = Number.parseInt(match[1], 10)
  const month = Number.parseInt(match[2], 10)
  const day = Number.parseInt(match[3], 10)

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null
  }

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

function parseDateTimeString(value: string): Date | null {
  const normalized = value.trim()

  if (!normalized) {
    return null
  }

  const dateOnly = parseDateOnlyString(normalized)
  if (dateOnly) {
    return dateOnly
  }

  if (!hasExplicitTimezone(normalized)) {
    const localMexicoMatch = normalized.match(
      /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})(?::(\d{2})(?:\.\d{1,6})?)?$/,
    )

    if (localMexicoMatch) {
      const seconds = localMexicoMatch[3] ?? "00"
      const parsed = new Date(`${localMexicoMatch[1]}T${localMexicoMatch[2]}:${seconds}-06:00`)

      return Number.isNaN(parsed.getTime()) ? null : parsed
    }
  }

  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function parseDateValue(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === "number") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (typeof value === "string") {
    return parseDateTimeString(value)
  }

  return null
}

function getMexicoParts(value: Date): MexicoDateParts {
  const parts = mexicoDatePartsFormatter.formatToParts(value)

  const map: MexicoDateParts = {
    year: "0000",
    month: "00",
    day: "00",
    hour: "00",
    minute: "00",
    second: "00",
  }

  for (const part of parts) {
    if (part.type in map) {
      map[part.type as keyof MexicoDateParts] = part.value
    }
  }

  return map
}

export function getCurrentMexicoDate(): string {
  const parts = getMexicoParts(new Date())
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function getCurrentMexicoTime(): string {
  const parts = getMexicoParts(new Date())
  return `${parts.hour}:${parts.minute}`
}

export function getCurrentMexicoIsoDateTime(): string {
  const parts = getMexicoParts(new Date())
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}-06:00`
}

export function formatDateTimeInMexico(
  value: unknown,
  options: Intl.DateTimeFormatOptions = {},
  fallback = "No registrado",
): string {
  const parsed = parseDateValue(value)

  if (!parsed) {
    return fallback
  }

  return new Intl.DateTimeFormat("es-MX", {
    timeZone: MEXICO_TIME_ZONE,
    ...options,
  }).format(parsed)
}

export function formatDateInMexico(
  value: unknown,
  options: Intl.DateTimeFormatOptions = {},
  fallback = "No registrado",
): string {
  return formatDateTimeInMexico(
    value,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...options,
    },
    fallback,
  )
}

export function getCurrentMexicoDateTimeLabel(): string {
  return formatDateTimeInMexico(
    new Date(),
    {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    },
    "",
  )
}

export function extractDateTimeInMexico(value: unknown): { date: string; time: string } | null {
  if (typeof value === "string") {
    const normalized = value.trim()

    if (!normalized) {
      return null
    }

    const dateOnly = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (dateOnly) {
      return {
        date: `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`,
        time: "00:00",
      }
    }

    if (!hasExplicitTimezone(normalized)) {
      const localMexicoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/)

      if (localMexicoMatch) {
        return {
          date: `${localMexicoMatch[1]}-${localMexicoMatch[2]}-${localMexicoMatch[3]}`,
          time: `${localMexicoMatch[4]}:${localMexicoMatch[5]}`,
        }
      }
    }
  }

  const parsed = parseDateValue(value)

  if (!parsed) {
    return null
  }

  const parts = getMexicoParts(parsed)
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  }
}

export function getDateTimeSortKey(date: string, time: string): string {
  const normalizedDate = date.trim()
  const normalizedTime = time.trim().slice(0, 5)
  return `${normalizedDate}T${normalizedTime}`
}

export function getMexicoDateTimeSortValue(value: unknown): number {
  const extracted = extractDateTimeInMexico(value)

  if (!extracted) {
    return 0
  }

  const numeric = Number(`${extracted.date.replace(/-/g, "")}${extracted.time.replace(/:/g, "")}`)
  return Number.isFinite(numeric) ? numeric : 0
}
