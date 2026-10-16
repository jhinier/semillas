import { AlertOctagon } from "lucide-react";
import { PantallaEstado } from "./pantalla-estado";

type PantallaErrorRutaProps = {
  error?: unknown;
  reset?: () => void;
};

export function PantallaErrorRuta({ reset }: PantallaErrorRutaProps) {
  return (
    <PantallaEstado
      icono={<AlertOctagon size={32} aria-hidden="true" />}
      titulo="Algo se rompio"
      descripcion="Tuvimos un problema al cargar esta pagina. Intenta de nuevo o vuelve al inicio para seguir usando Semillas."
      acciones={
        <>
          <button
            type="button"
            onClick={() => reset?.()}
            className="flex items-center justify-center rounded-xl bg-verde-brote px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Ir al inicio
          </a>
        </>
      }
    />
  );
}
