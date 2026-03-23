"use client";
import { expedienteService } from "@/servicios/expedienteService";
import { ExpedienteClinico } from "@/interfaz/expediente";

export default function RegistroExpediente() {
    
    const manejarCreacionExpediente = async (idDelPaciente: number) => {
        try {
            const datos: ExpedienteClinico = {
                paciente_id: idDelPaciente
            };

            const nuevoExpediente = await expedienteService.crear(datos);
            alert(`Expediente creado con éxito. ID: ${nuevoExpediente.id}`);
            
            // Aquí podrías redirigir a la pantalla de "Nueva Consulta" 
            // pasando este nuevo ID de expediente.
            
        } catch (error) {
            console.error("Fallo al crear el expediente:", error);
        }
    };

    return (
        <button onClick={() => manejarCreacionExpediente(1)}> 
            Generar Expediente Clínico
        </button>
    );
}