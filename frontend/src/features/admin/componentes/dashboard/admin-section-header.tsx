import type { ReactNode } from "react";

import { Boton } from "@/componentes/ui/boton";
import { Card } from "@/componentes/ui/card-base";

type AdminSectionHeaderProps = {
  icono: ReactNode;
  iconoContenedorClassName: string;
  titulo: string;
  descripcion: string;
  accionPrincipal: string;
  onAccionPrincipal: () => void;
  accionSecundaria?: ReactNode;
  accionSecundariaDeshabilitada?: boolean;
};

export function AdminSectionHeader({
  icono,
  iconoContenedorClassName,
  titulo,
  descripcion,
  accionPrincipal,
  onAccionPrincipal,
  accionSecundaria,
  accionSecundariaDeshabilitada = false,
}: AdminSectionHeaderProps) {
  return (
    <Card sombra="sm" className="p-6 text-left">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={iconoContenedorClassName}>{icono}</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">{titulo}</h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">{descripcion}</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex h-[42px] overflow-hidden rounded-xl shadow-xs">
            <Boton variante="exito" tamano="mediano" className="h-full rounded-none px-5 text-sm" onClick={onAccionPrincipal}>
              {accionPrincipal}
            </Boton>
            {accionSecundaria ? <div className="h-full w-px bg-slate-200" /> : null}
            {accionSecundaria ? (
              <Boton
                variante="exito"
                tamano="iconoPequeno"
                forma="cuadrado"
                disabled={accionSecundariaDeshabilitada}
                title="Más opciones"
                className="h-full rounded-none px-3"
              >
                {accionSecundaria}
              </Boton>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
