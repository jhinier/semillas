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
      "mt-4 w-full animate-in zoom-in-95 rounded-3xl border-2 border-green-200 bg-green-50 p-8 text-center shadow-sm dark:border-emerald-700 dark:bg-emerald-950/70",
      clase,
    )}>
      <div className="mb-6 flex justify-center text-green-500 dark:text-emerald-400">
        <div className="rounded-full bg-white p-4 shadow-md dark:bg-emerald-900">
          <Check size={64} strokeWidth={3} />
        </div>
      </div>
      <h4 className="mb-4 text-3xl font-bold text-green-800 dark:text-emerald-200">{titulo}</h4>
      <p className="mx-auto max-w-lg text-xl font-medium text-green-700 dark:text-emerald-300">{mensaje}</p>
    </div>
  );
}
