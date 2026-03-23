import { Paciente } from "@/interfaz/paciente";
import { pacienteService } from "@/servicios/pacienteService";
import { expedienteService } from "@/servicios/expedienteService";


const registrarTodo = async (datosPaciente: Paciente) => {
    try {
        // 1. Crear a la Paciente
        const pacienteCreada = await pacienteService.crear(datosPaciente);
        console.log("Paciente registrada:", pacienteCreada.id);

        // 2. Crear automáticamente su Expediente Clínico vacío
        const expedienteNuevo = await expedienteService.crear({
            paciente_id: pacienteCreada.id
        });
        console.log("Expediente generado:", expedienteNuevo.id);

        alert("Registro exitoso. Ya puede iniciar la primera consulta.");
        
    } catch (error) {
        alert("Hubo un fallo en el proceso de registro.");
    }
};