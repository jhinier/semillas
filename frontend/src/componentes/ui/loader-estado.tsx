import * as React from "react";
import { Loader } from "lucide-react";
import { unirClases } from "@/lib/utilidades";

type LoaderEstadoProps = {
  mensaje?: string;
  className?: string;
};

export function LoaderEstado({ mensaje = "Cargando...", className }: LoaderEstadoProps) {
  return (
    <div className={unirClases("flex items-center justify-center py-6", className)}>
      <Loader className="animate-spin text-primario" size={24} />
      <span className="ml-2 text-sm text-neutro">{mensaje}</span>
    </div>
  );
}
