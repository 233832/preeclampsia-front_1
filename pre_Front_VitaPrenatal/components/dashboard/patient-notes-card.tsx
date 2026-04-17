"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Save, Trash2, Loader2, PencilLine, X } from "lucide-react"
import { notaService } from "@/servicios/notaService"
import { NotaClinica } from "@/interfaz/nota"
import { toast } from "@/hooks/use-toast"
import { formatDateTimeInMexico, getMexicoDateTimeSortValue } from "@/lib/mexico-time"

interface PatientNotesCardProps {
  consultationId?: string
  patientId?: number | null
}

function parseConsultationId(value?: string): number | null {
  if (!value) {
    return null
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function formatNoteDate(value: string): string {
  return formatDateTimeInMexico(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }, "Fecha no disponible")
}

export function PatientNotesCard({ consultationId, patientId }: PatientNotesCardProps) {
  const [notas, setNotas] = useState<NotaClinica[]>([])
  const [nuevaNota, setNuevaNota] = useState("")
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [textoEditado, setTextoEditado] = useState("")
  const [loadingNotas, setLoadingNotas] = useState(false)
  const [savingNota, setSavingNota] = useState(false)
  const [savingEditId, setSavingEditId] = useState<number | null>(null)
  const [deletingNotaId, setDeletingNotaId] = useState<number | null>(null)

  const loadNotas = async () => {
    const consultaId = parseConsultationId(consultationId)

    if (!consultaId) {
      setNotas([])
      return
    }

    setLoadingNotas(true)

    try {
      const result = await notaService.listarPorConsulta(consultaId)
      const sorted = [...result].sort((a, b) => {
        const dateA = getMexicoDateTimeSortValue(a.fecha_creacion)
        const dateB = getMexicoDateTimeSortValue(b.fecha_creacion)
        return dateB - dateA
      })

      setNotas(sorted)
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudieron cargar las notas clinicas."
      toast({
        variant: "destructive",
        title: "Error al cargar notas",
        description: message,
      })
      setNotas([])
    } finally {
      setLoadingNotas(false)
    }
  }

  useEffect(() => {
    setEditandoId(null)
    setTextoEditado("")
    void loadNotas()
  }, [consultationId])

  const iniciarEdicion = (nota: NotaClinica) => {
    if (editandoId !== null && editandoId !== nota.id) {
      toast({
        title: "Edicion en curso",
        description: "Guarda o cancela la nota actual antes de editar otra.",
      })
      return
    }

    setEditandoId(nota.id)
    setTextoEditado(nota.contenido)
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setTextoEditado("")
  }

  const guardarEdicion = async (notaId: number) => {
    const contenido = textoEditado.trim()

    if (!contenido) {
      toast({
        variant: "destructive",
        title: "Contenido vacio",
        description: "La nota editada no puede estar vacia.",
      })
      return
    }

    setSavingEditId(notaId)

    try {
      await notaService.actualizar(notaId, contenido)
      setEditandoId(null)
      setTextoEditado("")
      await loadNotas()
      toast({
        title: "Nota actualizada",
        description: "Los cambios se guardaron correctamente.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la nota clinica."
      toast({
        variant: "destructive",
        title: "Error al editar nota",
        description: message,
      })
    } finally {
      setSavingEditId(null)
    }
  }

  const handleSaveNota = async () => {
    const consultaId = parseConsultationId(consultationId)
    const contenido = nuevaNota.trim()

    if (!consultaId || !patientId) {
      toast({
        variant: "destructive",
        title: "Datos incompletos",
        description: "No hay consulta o paciente valido para guardar la nota.",
      })
      return
    }

    if (!contenido) {
      toast({
        variant: "destructive",
        title: "Nota vacia",
        description: "Escribe observaciones o sintomas antes de guardar.",
      })
      return
    }

    setSavingNota(true)

    try {
      await notaService.crear({
        consulta_id: consultaId,
        paciente_id: patientId,
        contenido,
      })

      setNuevaNota("")
      await loadNotas()
      toast({
        title: "Nota guardada",
        description: "La nota clinica se registro correctamente.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar la nota clinica."
      toast({
        variant: "destructive",
        title: "Error al guardar nota",
        description: message,
      })
    } finally {
      setSavingNota(false)
    }
  }

  const handleDeleteNota = async (notaId: number) => {
    const confirmed = window.confirm("¿Eliminar esta nota?")

    if (!confirmed) {
      return
    }

    setDeletingNotaId(notaId)

    try {
      await notaService.eliminar(notaId)
      await loadNotas()
      toast({
        title: "Nota eliminada",
        description: "La nota clinica fue eliminada correctamente.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar la nota clinica."
      toast({
        variant: "destructive",
        title: "Error al eliminar nota",
        description: message,
      })
    } finally {
      setDeletingNotaId(null)
    }
  }

  const canSave = !!nuevaNota.trim() && !savingNota

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-5 w-5 text-primary" />
          Notas del Paciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
            <h4 className="text-sm font-semibold">Notas registradas</h4>
            <ScrollArea className="h-[320px] pr-2">
              <div className="space-y-3">
                {loadingNotas && (
                  <div className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
                    Cargando notas...
                  </div>
                )}

                {!loadingNotas && notas.length === 0 && (
                  <div className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
                    No hay notas registradas para esta consulta.
                  </div>
                )}

                {!loadingNotas &&
                  notas.map((nota) => {
                    const isEditing = editandoId === nota.id
                    const isDeleting = deletingNotaId === nota.id
                    const isSavingEdit = savingEditId === nota.id
                    const disableActions = savingNota || loadingNotas || isSavingEdit

                    return (
                      <div
                        key={nota.id}
                        className={`rounded-lg border bg-card p-3 shadow-sm space-y-2 ${
                          isEditing ? "border-primary/50 ring-1 ring-primary/20" : "border-border/60"
                        }`}
                      >
                        {isEditing ? (
                          <Textarea
                            value={textoEditado}
                            onChange={(e) => setTextoEditado(e.target.value)}
                            className="w-full min-h-[90px] resize-none"
                            placeholder="Edita el contenido de la nota..."
                          />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{nota.contenido}</p>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">{formatNoteDate(nota.fecha_creacion)}</span>

                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => guardarEdicion(nota.id)}
                                disabled={isSavingEdit}
                              >
                                {isSavingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Guardar cambios"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={cancelarEdicion}
                                disabled={isSavingEdit}
                              >
                                <X className="h-3.5 w-3.5" />
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-primary/80 hover:text-primary"
                                onClick={() => iniciarEdicion(nota)}
                                disabled={disableActions || editandoId !== null}
                              >
                                <PencilLine className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteNota(nota.id)}
                                disabled={isDeleting || editandoId !== null}
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
            <h4 className="text-sm font-semibold">Escribir nota</h4>
            <Textarea
              value={nuevaNota}
              onChange={(e) => setNuevaNota(e.target.value)}
              placeholder="Escribe observaciones o sintomas..."
              className="min-h-[220px] resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {nuevaNota.length > 0 ? `${nuevaNota.length} caracteres` : "Sin contenido"}
              </p>
              <Button onClick={handleSaveNota} disabled={!canSave} className="gap-2">
                {savingNota ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar nota
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
