import * as React from "react";
import { Loader, AlertCircle, Inbox } from "lucide-react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesStateView extends React.HTMLAttributes<HTMLDivElement> {
  cargando?: boolean;
  error?: Error | string | null;
  vacio?: boolean;
  mensajeVacio?: string;
  colorCarga?: string;
  mensajeCarga?: string;
  children: React.ReactNode;
  clase?: string;
}

function EstadoCarga({ color, mensaje }: { color?: string; mensaje?: string }) {
  return (
    <div
      className="flex flex-col gap-4 justify-center items-center h-64 bg-white rounded-[2.5rem] shadow-xl"
      style={color ? { color } : undefined}
    >
      <Loader className="animate-spin size-12" />
      {mensaje && (
        <p className="font-bold animate-pulse text-xl">{mensaje}</p>
      )}
    </div>
  );
}

function EstadoError({ mensaje }: { mensaje?: string }) {
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-64 bg-white rounded-[2.5rem] shadow-xl text-red-500">
      <AlertCircle className="size-12" />
      <p className="font-bold text-xl text-center px-4">
        {mensaje || "Ocurrió un error al cargar la información."}
      </p>
    </div>
  );
}

function EstadoVacio({ mensaje }: { mensaje?: string }) {
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-64 bg-white rounded-[2.5rem] shadow-xl text-slate-400">
      <Inbox className="size-12" />
      <p className="font-bold text-lg text-center px-4">
        {mensaje || "No hay información disponible."}
      </p>
    </div>
  );
}

export const StateView = React.forwardRef<HTMLDivElement, PropiedadesStateView>(
  (
    {
      cargando = false,
      error = null,
      vacio = false,
      mensajeVacio,
      colorCarga,
      mensajeCarga,
      children,
      clase,
      className,
      ...propiedades
    },
    referencia,
  ) => {
    const mensajeError = typeof error === "string" ? error : error?.message;

    return (
      <div
        ref={referencia}
        className={unirClases(className, clase)}
        {...propiedades}
      >
        {cargando ? (
          <EstadoCarga color={colorCarga} mensaje={mensajeCarga} />
        ) : error ? (
          <EstadoError mensaje={mensajeError} />
        ) : vacio ? (
          <EstadoVacio mensaje={mensajeVacio} />
        ) : (
          children
        )}
      </div>
    );
  }
);
StateView.displayName = "StateView";
