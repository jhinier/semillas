import { Sprout } from "lucide-react";

export function PantallaCargaSesion() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-crema-fondo via-white to-slate-50 px-6"
      data-testid="pantalla-carga-sesion"
    >
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-white/80 px-10 py-12 shadow-xl ring-1 ring-slate-100 max-w-sm text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-verde-brote/10">
          <Sprout className="text-verde-brote" size={36} aria-hidden="true" />
          <span className="absolute inset-0 animate-ping rounded-2xl bg-verde-brote/20" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-bold text-slate-800">Restaurando tu sesion</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Estamos preparando tu espacio en Semillas. Esto solo tomara un momento.
          </p>
        </div>
        <div
          className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Cargando"
        >
          <div className="h-full w-1/3 animate-[carga_1.2s_ease-in-out_infinite] rounded-full bg-verde-brote" />
        </div>
      </div>
    </div>
  );
}
