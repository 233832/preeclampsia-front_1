"use client"; // Indica que este componente tiene interacción (clics, estados)

import { useState } from "react";
import { consultaService } from "@/servicios/consultaService";
import { Consulta } from "@/interfaz/consulta";

export default function NuevaConsulta() {
  // 1. Estado para los datos del formulario (el molde de la interfaz)
  const [datosForm, setDatosForm] = useState<Consulta>({
    paciente_id: 1, // Estos IDs normalmente vienen de una selección previa
    expediente_id: 1,
    fecha_hora_consulta: new Date().toISOString(),
    edad_madre: 0,
    edad_gestacional: 0,
    altura: 0,
    peso: 0,
    imc: 0,
    presion_sistolica: 0,
    presion_diastolica: 0,
  });

  // 2. Tu lógica de envío (corregida)
  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    try {
      // A. Guardamos la consulta primero en el Back de Python
      const nuevaConsulta = await consultaService.crear(datosForm);
      console.log("Consulta guardada con ID:", nuevaConsulta.id);

      // B. Pedimos la predicción a Gemini
      const analisis = await consultaService.obtenerPrediccion(nuevaConsulta.id);
      
      // C. Mostramos el resultado
      alert(`Riesgo: ${analisis.riesgo}\nInterpretación: ${analisis.interpretacion}`);
      
    } catch (error) {
      console.error("Algo salió mal:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  // 3. Función para actualizar los datos conforme escribes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosForm({
      ...datosForm,
      [name]: name.includes('presion') || name.includes('edad') ? parseInt(value) : parseFloat(value)
    });
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Nueva Consulta - VitaPrenatal</h2>
      
      <form onSubmit={manejarEnvio} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="number" name="presion_sistolica" placeholder="Presión Sistólica (ej: 120)" 
            onChange={handleChange} className="border p-2 rounded"
          />
          <input 
            type="number" name="presion_diastolica" placeholder="Presión Diastólica (ej: 80)" 
            onChange={handleChange} className="border p-2 rounded"
          />
          <input 
            type="number" name="edad_madre" placeholder="Edad de la Madre" 
            onChange={handleChange} className="border p-2 rounded"
          />
          <input 
            type="number" name="peso" placeholder="Peso (kg)" 
            onChange={handleChange} className="border p-2 rounded"
          />
        </div>

        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Guardar y Analizar Riesgo
        </button>
      </form>
    </div>
  );
}