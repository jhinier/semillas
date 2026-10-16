import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export type EstadoUsuario = "activo" | "pendiente" | "bloqueado";

const CONFIG_ESTADO: Record<EstadoUsuario, { etiqueta: string; puntoColor: string; textoColor: string }> = {
  activo: {
    etiqueta: "Activo",
    puntoColor: "bg-green-600",
    textoColor: "text-green-600",
  },
  pendiente: {
    etiqueta: "Pendiente",
    puntoColor: "bg-amber-500",
    textoColor: "text-amber-500",
  },
  bloqueado: {
    etiqueta: "Bloqueado",
    puntoColor: "bg-slate-400",
    textoColor: "text-slate-500",
  },
};

export type BadgeEstadoUsuarioProps = {
  estado: EstadoUsuario;
  className?: string;
};

export function BadgeEstadoUsuario({ estado, className }: BadgeEstadoUsuarioProps) {
  const config = CONFIG_ESTADO[estado] ?? CONFIG_ESTADO.bloqueado;
  return (
    <div className={unirClases("inline-flex items-center gap-1.5", className)}>
      <span className={unirClases("w-1.5 h-1.5 rounded-full", config.puntoColor)} />
      <span className={unirClases("font-bold text-[12px]", config.textoColor)}>
        {config.etiqueta}
      </span>
    </div>
  );
}
