// frontend/src/componentes/ui/etiqueta-pildora.tsx
import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesEtiquetaPildora {
  variante: "exito" | "pendiente" | "bloqueado";
  children: React.ReactNode;
  clase?: string;
}

const ESTILOS = {
  exito: "bg-green-50 text-green-700 border border-green-100",
  pendiente: "bg-slate-100 text-slate-500 border border-slate-200",
  bloqueado: "bg-slate-100 text-slate-500 border border-slate-200",
};

export function EtiquetaPildora({ variante, children, clase }: PropiedadesEtiquetaPildora) {
  return (
    <span className={unirClases(
      "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider",
      ESTILOS[variante],
      clase,
    )}>
      {children}
    </span>
  );
}
