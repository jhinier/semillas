// frontend/src/componentes/ui/alerta-completado.tsx
import * as React from "react";
import { Check } from "lucide-react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesAlertaCompletado {
  titulo?: string;
  mensaje: string;
  clase?: string;
}

export function AlertaCompletado({
  titulo = "¡Excelente Trabajo!",
  mensaje,
  clase,
}: PropiedadesAlertaCompletado) {
  return (
    <div className={unirClases(
      "w-full p-8 bg-green-50 rounded-3xl border-2 border-green-200 text-center animate-in zoom-in-95 mt-4 shadow-sm",
      clase,
    )}>
      <div className="flex justify-center mb-6 text-green-500">
        <div className="bg-white p-4 rounded-full shadow-md">
          <Check size={64} strokeWidth={3} />
        </div>
      </div>
      <h4 className="text-3xl font-bold text-green-800 mb-4">{titulo}</h4>
      <p className="text-green-700 text-xl font-medium max-w-lg mx-auto">{mensaje}</p>
    </div>
  );
}
