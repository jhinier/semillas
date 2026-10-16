import * as React from "react";

import { unirClases } from "@/lib/utilidades";

type ConfiguracionEstado = {
  etiqueta: string;
  clases: string;
};

const CONFIGURACIONES_ESTADO: Record<string, ConfiguracionEstado> = {
  publicado: {
    etiqueta: "Publicado",
    clases: "bg-[#eefcf4] text-[#2E9E5B] border border-[#2E9E5B]/10",
  },
  revision: {
    etiqueta: "En revisión",
    clases: "bg-[#6C3AED]/10 text-[#6C3AED] border border-[#6C3AED]/10",
  },
  "en revisión": {
    etiqueta: "En revisión",
    clases: "bg-[#6C3AED]/10 text-[#6C3AED] border border-[#6C3AED]/10",
  },
  borrador: {
    etiqueta: "Borrador",
    clases: "bg-[#F4B740]/15 text-[#d9921c] border border-[#F4B740]/15",
  },
  archivado: {
    etiqueta: "Archivado",
    clases: "bg-slate-100 text-slate-600 border border-slate-200/50",
  },
};

type BadgeEstadoProps = {
  estado: string;
  className?: string;
};

function normalizarEstado(estado: string) {
  return estado.trim().toLowerCase();
}

function capitalizarTexto(texto: string) {
  return texto.length === 0 ? texto : `${texto.slice(0, 1).toUpperCase()}${texto.slice(1)}`;
}

export function BadgeEstado({ estado, className }: BadgeEstadoProps) {
  const estadoNormalizado = normalizarEstado(estado);
  const configuracion = CONFIGURACIONES_ESTADO[estadoNormalizado] ?? {
    etiqueta: capitalizarTexto(estado.trim()),
    clases: "bg-slate-100 text-slate-600 border border-slate-200/50",
  };

  return (
    <span className={unirClases("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", configuracion.clases, className)}>
      {configuracion.etiqueta}
    </span>
  );
}
