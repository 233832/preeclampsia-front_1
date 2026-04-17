"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { MedicacionResponse, RiesgoCanonicoMedicacion } from "@/interfaz/medicacion"
import { normalizeMedicacionRisk } from "@/lib/medicacion-risk-normalization"
import { getMedicacionPorRiesgo, MedicacionServiceError } from "@/servicios/medicacionService"

interface UseMedicacionResult {
  data: MedicacionResponse | null
  loading: boolean
  error: string | null
  invalidRiskMessage: string | null
  normalizedRisk: RiesgoCanonicoMedicacion | null
  refetch: () => Promise<void>
}

interface UseMedicacionOptions {
  enabled?: boolean
}

export function useMedicacion(
  riesgo: string,
  options: UseMedicacionOptions = {},
): UseMedicacionResult {
  const enabled = options.enabled ?? true
  const [data, setData] = useState<MedicacionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invalidRiskMessage, setInvalidRiskMessage] = useState<string | null>(null)

  const normalizedRisk = useMemo(() => {
    return normalizeMedicacionRisk(riesgo).canonicalRisk
  }, [riesgo])

  const fetchMedicacion = useCallback(async () => {
    if (!enabled) {
      setData(null)
      setLoading(false)
      setError(null)
      setInvalidRiskMessage(null)
      return
    }

    const trimmedRisk = riesgo.trim()

    if (!trimmedRisk) {
      setData(null)
      setError(null)
      setInvalidRiskMessage(null)
      return
    }

    setLoading(true)
    setError(null)
    setInvalidRiskMessage(null)

    try {
      const response = await getMedicacionPorRiesgo(trimmedRisk)
      setData(response)
    } catch (error) {
      setData(null)

      if (error instanceof MedicacionServiceError && error.invalidRisk) {
        setInvalidRiskMessage(error.message)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("No se pudo obtener medicacion")
      }
    } finally {
      setLoading(false)
    }
  }, [enabled, riesgo])

  useEffect(() => {
    if (!enabled) {
      return
    }

    void fetchMedicacion()
  }, [enabled, fetchMedicacion])

  return {
    data,
    loading,
    error,
    invalidRiskMessage,
    normalizedRisk,
    refetch: fetchMedicacion,
  }
}
