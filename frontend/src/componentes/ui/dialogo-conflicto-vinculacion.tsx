import { AlertTriangle, LogIn, UserCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type DialogoConflictoVinculacionProps = {
  mensaje: string;
  onContinuarInvitado: () => void;
  onCambiarCuenta: () => void;
};

function DialogoContenido({
  mensaje,
  onContinuarInvitado,
  onCambiarCuenta,
}: DialogoConflictoVinculacionProps) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/90" aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflicto-titulo"
        aria-describedby="conflicto-descripcion"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl ring-1 ring-slate-200"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="text-amber-600" size={28} aria-hidden="true" />
        </div>

        <h2 id="conflicto-titulo" className="text-lg font-bold text-slate-800 mb-2">
          Esta cuenta ya esta vinculada
        </h2>

        <p id="conflicto-descripcion" className="text-sm text-slate-500 mb-6 leading-relaxed">
          {mensaje}
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-testid="conflicto-cambiar-cuenta"
            onClick={onCambiarCuenta}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-verde-brote px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            <LogIn size={18} aria-hidden="true" />
            Iniciar sesion con otra cuenta
          </button>

          <button
            type="button"
            data-testid="conflicto-seguir-invitado"
            onClick={onContinuarInvitado}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <UserCheck size={18} aria-hidden="true" />
            Seguir como invitado
          </button>
        </div>
      </section>
    </div>
  );
}

export function DialogoConflictoVinculacion(props: DialogoConflictoVinculacionProps) {
  const botonPrimarioRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botonPrimarioRef.current?.focus();

    function manejarEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
      }
    }

    document.addEventListener("keydown", manejarEscape);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", manejarEscape);
    };
  }, []);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(<DialogoContenido {...props} />, document.body);
}

export { DialogoContenido };
