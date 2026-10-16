import * as React from "react";
import { unirClases } from "@/lib/utilidades";

type EmptyStateProps = {
  mensaje?: string;
  className?: string;
};

export function EmptyState({ mensaje = "No se encontraron resultados.", className }: EmptyStateProps) {
  return (
    <div className={unirClases("col-span-full py-12 text-center text-slate-400", className)}>
      {mensaje}
    </div>
  );
}
