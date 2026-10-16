import * as React from "react";
import { Card } from "@/componentes/ui/card-base";

type PanelSeccionAdminProps = {
  titulo: React.ReactNode;
  descripcion?: React.ReactNode;
  accion?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  sombra?: "sm" | "md" | "lg";
  hoverEffect?: "none" | "elevate";
  className?: string;
  contenidoClassName?: string;
};

export function PanelSeccionAdmin({
  titulo,
  descripcion,
  accion,
  footer,
  children,
  sombra = "md",
  hoverEffect = "none",
  className,
  contenidoClassName,
}: PanelSeccionAdminProps) {
  return (
    <Card sombra={sombra} hoverEffect={hoverEffect} className={className}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[clamp(1.35rem,1.55vw,2rem)] font-black leading-none tracking-tight text-slate-900">
            {titulo}
          </h3>
          {descripcion ? <p className="mt-2 text-xs leading-snug text-slate-500 sm:text-sm">{descripcion}</p> : null}
        </div>
        {accion ? <div className="shrink-0 pt-1">{accion}</div> : null}
      </div>

      <div className={`min-w-0 ${contenidoClassName}`}>{children}</div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </Card>
  );
}
