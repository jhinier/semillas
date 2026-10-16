import * as React from "react";

import { unirClases } from "@/lib/utilidades";

type BaseFilaListaCompactaProps = {
  izquierda: React.ReactNode;
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  derecha?: React.ReactNode;
  izquierdaClassName?: string;
  contenidoClassName?: string;
  derechaClassName?: string;
  className?: string;
  clase?: string;
};

export type FilaListaCompactaInteractivaProps = BaseFilaListaCompactaProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    onClick: () => void;
  };

export type FilaListaCompactaPasivaProps = BaseFilaListaCompactaProps &
  React.HTMLAttributes<HTMLDivElement> & {
    onClick?: undefined;
  };

export type FilaListaCompactaProps =
  | FilaListaCompactaInteractivaProps
  | FilaListaCompactaPasivaProps;

function esInteractiva(props: FilaListaCompactaProps): props is FilaListaCompactaInteractivaProps {
  return typeof props.onClick === "function";
}

function contenidoFila({
  izquierda,
  titulo,
  subtitulo,
  derecha,
  izquierdaClassName,
  contenidoClassName,
  derechaClassName,
}: BaseFilaListaCompactaProps) {
  return (
    <>
      <div className={unirClases("shrink-0", izquierdaClassName)}>{izquierda}</div>
      <div className={unirClases("min-w-0 flex-1 text-left", contenidoClassName)}>
        <span className="block text-xs font-extrabold text-neutro-oscuro-max truncate leading-tight sm:text-sm">
          {titulo}
        </span>
        {subtitulo ? (
          <span className="mt-0.5 block truncate text-xs leading-tight text-neutro">{subtitulo}</span>
        ) : null}
      </div>
      {derecha ? <div className={unirClases("shrink-0", derechaClassName)}>{derecha}</div> : null}
    </>
  );
}

function FilaListaCompactaInteractiva({
  izquierda,
  titulo,
  subtitulo,
  derecha,
  izquierdaClassName,
  contenidoClassName,
  derechaClassName,
  className,
  clase,
  onClick,
  type = "button",
  ...propiedades
}: FilaListaCompactaInteractivaProps) {
  const clasesBase = unirClases(
    "flex items-center gap-3 rounded-2xl border border-slate-100/50 bg-slate-50/20 p-3 transition-colors select-none cursor-pointer hover:bg-slate-50/70",
    className,
    clase,
  );

  return (
    <button type={type} onClick={onClick} className={clasesBase} {...propiedades}>
      {contenidoFila({
        izquierda,
        titulo,
        subtitulo,
        derecha,
        izquierdaClassName,
        contenidoClassName,
        derechaClassName,
      })}
    </button>
  );
}

function FilaListaCompactaPasiva({
  izquierda,
  titulo,
  subtitulo,
  derecha,
  izquierdaClassName,
  contenidoClassName,
  derechaClassName,
  className,
  clase,
  ...propiedades
}: FilaListaCompactaPasivaProps) {
  const clasesBase = unirClases(
    "flex items-center gap-3 rounded-2xl border border-slate-100/50 bg-slate-50/20 p-3 transition-colors select-none",
    className,
    clase,
  );

  return (
    <div className={clasesBase} {...propiedades}>
      {contenidoFila({
        izquierda,
        titulo,
        subtitulo,
        derecha,
        izquierdaClassName,
        contenidoClassName,
        derechaClassName,
      })}
    </div>
  );
}

export function FilaListaCompacta(props: FilaListaCompactaProps) {
  return esInteractiva(props) ? (
    <FilaListaCompactaInteractiva {...props} />
  ) : (
    <FilaListaCompactaPasiva {...props} />
  );
}
