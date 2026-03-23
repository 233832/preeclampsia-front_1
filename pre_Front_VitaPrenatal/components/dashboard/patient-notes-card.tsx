"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Save, CheckCircle2 } from "lucide-react"

interface PatientNotesCardProps {
  initialNotes?: string
  onSave?: (notes: string) => void
}

export function PatientNotesCard({ initialNotes = "", onSave }: PatientNotesCardProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isSaved, setIsSaved] = useState(false)

  // Update notes when initialNotes changes (e.g., when selecting a different consultation)
  useEffect(() => {
    setNotes(initialNotes)
    setIsSaved(false)
  }, [initialNotes])

  const handleSave = () => {
    onSave?.(notes)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-5 w-5 text-primary" />
          Notas del Paciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setIsSaved(false)
          }}
          placeholder="Escribe observaciones o sintomas..."
          className="min-h-[120px] resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {notes.length > 0 ? `${notes.length} caracteres` : "Sin notas registradas"}
          </p>
          <Button 
            onClick={handleSave} 
            disabled={notes.length === 0}
            className="gap-2"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Guardado
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar comentario
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
